import type { ClipGenerator, ClipOptions, ClipPollResult, ClipResult } from "@/lib/video/types";

const KIE_API_BASE = "https://api.kie.ai";

// Default to Kling 2.1 Standard — ~$0.125/5s clip vs $0.14 direct
const DEFAULT_KIE_MODEL = "kling-v2-1-standard";
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
    const res = await fetch(`${KIE_API_BASE}/api/v1/kling/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        prompt: opts.prompt,
        negativePrompt: "blurry, low quality, watermark, text overlay",
        duration: toDuration(opts.durationSeconds),
        aspectRatio: opts.aspectRatio,
        model: DEFAULT_KIE_MODEL,
        ...(opts.referenceImage ? { imageUrl: opts.referenceImage } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`kie.ai submit failed (${res.status}): ${body}`);
    }

    const json = await res.json();
    const taskId: string = json?.data?.taskId;
    if (!taskId) throw new Error(`kie.ai: no taskId in response: ${JSON.stringify(json)}`);
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
    const state: string = json?.data?.state ?? json?.data?.status ?? "";

    if (state === "success") {
      const resultJson = json?.data?.resultJson;
      const parsed = typeof resultJson === "string" ? JSON.parse(resultJson) : resultJson;
      // kie.ai may return { videos: [{ url }] } or { url } or [{ url }]
      const videoUrl: string =
        parsed?.videos?.[0]?.url ?? parsed?.url ?? parsed?.[0]?.url;
      if (!videoUrl) throw new Error(`kie.ai: success but no video URL: ${JSON.stringify(json)}`);
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
      const reason = json?.data?.failReason ?? json?.data?.message ?? "unknown";
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
