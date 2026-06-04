import type { ClipGenerator, ClipOptions, ClipPollResult, ClipResult } from "@/lib/video/types";

const KIE_API_BASE = "https://api.kie.ai";

// Kling 2.6 via kie.ai unified market API — ~$0.125/5s clip
const DEFAULT_KIE_MODEL = "kling-2.6/text-to-video";
const COST_PER_SECOND_USD = 0.025;

function getAuthHeader(): string {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) throw new Error("KIE_API_KEY not set");
  return `Bearer ${apiKey}`;
}

function toDuration(seconds: number): string {
  return seconds <= 5 ? "5" : "10";
}

export class KieGenerator implements ClipGenerator {
  name = "kie";

  async submitClip(opts: ClipOptions): Promise<string> {
    const res = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        model: DEFAULT_KIE_MODEL,
        input: {
          prompt: opts.prompt,
          negative_prompt: "blurry, low quality, watermark, text overlay",
          duration: toDuration(opts.durationSeconds),
          aspect_ratio: opts.aspectRatio,
          sound: false,
          ...(opts.referenceImage ? { image_url: opts.referenceImage } : {}),
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`kie.ai submit failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    // kie.ai returns task_id (snake_case) in the unified market API
    const taskId: string = json?.data?.task_id ?? json?.data?.taskId;
    if (!taskId) throw new Error(`kie.ai: no task_id in response: ${JSON.stringify(json)}`);
    return taskId;
  }

  async checkClip(taskId: string, opts: ClipOptions): Promise<ClipPollResult> {
    const res = await fetch(
      `${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: { Authorization: getAuthHeader() } }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`kie.ai poll failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const data = json?.data ?? {};
    const state: string = data.state ?? data.status ?? "";

    if (state === "success") {
      // resultJson is a JSON string containing { resultUrls: [url, ...] }
      const resultJson = data.resultJson;
      const parsed = typeof resultJson === "string" ? JSON.parse(resultJson) : resultJson;
      const videoUrl: string = parsed?.resultUrls?.[0] ?? parsed?.video_url ?? data.video_url;
      if (!videoUrl) throw new Error(`kie.ai: success but no video_url: ${JSON.stringify(json)}`);
      const actualDuration = parseInt(toDuration(opts.durationSeconds), 10);
      return {
        done: true,
        result: {
          videoUrl,
          durationSeconds: actualDuration,
          model: DEFAULT_KIE_MODEL,
          costEstimateUsd: actualDuration * COST_PER_SECOND_USD,
        },
      };
    }

    if (state === "fail" || state === "failed") {
      const reason = data.failReason ?? data.fail_reason ?? data.message ?? "unknown";
      throw new Error(`kie.ai: task failed — ${reason}`);
    }

    // states: waiting | queuing | generating → not done yet
    return { done: false };
  }

  async generateClip(opts: ClipOptions): Promise<ClipResult> {
    const taskId = await this.submitClip(opts);
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const result = await this.checkClip(taskId, opts);
      if (result.done) return result.result;
    }
    throw new Error("kie.ai: timed out waiting for video");
  }
}
