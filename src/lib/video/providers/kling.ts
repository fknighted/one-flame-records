import type { ClipGenerator, ClipOptions, ClipPollResult, ClipResult } from "@/lib/video/types";

const KLING_API_BASE = "https://api.klingai.com";
const MODEL = "kling-v1";
const MODE = "std"; // kling-v1 supports std/pro; kling-v1-5 only supports pro

// Cost estimate: ~$0.14 per 5-second standard clip
const COST_PER_SECOND_USD = 0.028;

// Kling uses JWT auth — generated from Access Key + Secret Key
function makeJwt(accessKey: string, secretKey: string): string {
  // JWT payload: { iss: accessKey, exp: now+30min, nbf: now-5s }
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: accessKey, exp: now + 1800, nbf: now - 5 })
  ).toString("base64url");

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHmac } = require("crypto");
  const sig = createHmac("sha256", secretKey)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${sig}`;
}

function getAuth(): string {
  const accessKey = process.env.KLING_ACCESS_KEY;
  const secretKey = process.env.KLING_SECRET_KEY;
  if (!accessKey || !secretKey) throw new Error("KLING_ACCESS_KEY / KLING_SECRET_KEY not set");
  return makeJwt(accessKey, secretKey);
}

function toKlingAspectRatio(ar: ClipOptions["aspectRatio"]): string {
  return ar; // Kling accepts "16:9", "9:16", "1:1" directly
}

function toKlingDuration(seconds: number): string {
  // Kling accepts "5" or "10"
  return seconds <= 5 ? "5" : "10";
}

async function submitTask(opts: ClipOptions): Promise<string> {
  const res = await fetch(`${KLING_API_BASE}/v1/videos/text2video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuth()}`,
    },
    body: JSON.stringify({
      model_name: MODEL,
      prompt: opts.prompt,
      negative_prompt: "blurry, low quality, watermark, text overlay",
      cfg_scale: 0.5,
      mode: MODE,
      duration: toKlingDuration(opts.durationSeconds),
      aspect_ratio: toKlingAspectRatio(opts.aspectRatio),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kling submit failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const taskId: string = json?.data?.task_id;
  if (!taskId) throw new Error("Kling: no task_id in response");
  return taskId;
}

async function checkTask(taskId: string, opts: ClipOptions): Promise<ClipPollResult> {
  const res = await fetch(`${KLING_API_BASE}/v1/videos/text2video/${taskId}`, {
    headers: { Authorization: `Bearer ${getAuth()}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kling poll failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const status: string = json?.data?.task_status;

  if (status === "succeed") {
    const url: string = json?.data?.task_result?.videos?.[0]?.url;
    if (!url) throw new Error("Kling: task succeeded but no video URL");
    const actualDuration = parseInt(toKlingDuration(opts.durationSeconds), 10);
    return {
      done: true,
      result: {
        videoUrl: url,
        durationSeconds: actualDuration,
        model: MODEL,
        costEstimateUsd: actualDuration * COST_PER_SECOND_USD,
      },
    };
  }

  if (status === "failed") {
    throw new Error(`Kling: task failed — ${json?.data?.task_status_msg ?? "unknown"}`);
  }

  return { done: false };
}

export class KlingGenerator implements ClipGenerator {
  name = "kling";

  async submitClip(opts: ClipOptions): Promise<string> {
    return submitTask(opts);
  }

  async checkClip(taskId: string, opts: ClipOptions): Promise<ClipPollResult> {
    return checkTask(taskId, opts);
  }

  async generateClip(opts: ClipOptions): Promise<ClipResult> {
    const taskId = await submitTask(opts);
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const result = await checkTask(taskId, opts);
      if (result.done) return result.result;
    }
    throw new Error("Kling: timed out waiting for video");
  }
}
