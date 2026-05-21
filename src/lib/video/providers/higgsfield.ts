import type { ClipGenerator, ClipOptions, ClipPollResult, ClipResult } from "@/lib/video/types";

// Rough estimate for DoP-turbo per clip
const COST_PER_CLIP_USD = 0.08;

function getClient() {
  const credentials = process.env.HF_CREDENTIALS;
  if (!credentials) throw new Error("HF_CREDENTIALS not set");
  // Dynamic import keeps this server-only and avoids edge-runtime issues
  const { createHiggsfieldClient } = require("@higgsfield/client/v2") as typeof import("@higgsfield/client/v2");
  return createHiggsfieldClient({ credentials });
}

export class HiggsFieldGenerator implements ClipGenerator {
  name = "higgsfield";

  async submitClip(_opts: ClipOptions): Promise<string> {
    throw new Error("HiggsFieldGenerator: use generateClip directly (SDK handles polling)");
  }

  async checkClip(_taskId: string, _opts: ClipOptions): Promise<ClipPollResult> {
    throw new Error("HiggsFieldGenerator: use generateClip directly (SDK handles polling)");
  }

  async generateClip(opts: ClipOptions): Promise<ClipResult> {
    if (!opts.referenceImage) {
      throw new Error(
        "HiggsFieldGenerator requires a referenceImage — DoP is image-to-video. " +
        "Use KlingGenerator for text-to-video without a reference image."
      );
    }

    const client = getClient();

    const response = await client.subscribe("/v1/image2video/dop", {
      input: {
        model: "dop-turbo",
        prompt: opts.prompt,
        input_images: [{ type: "image_url", image_url: opts.referenceImage }],
        seed: opts.seed,
        enhance_prompt: true,
      },
      withPolling: true,
    });

    if (response.status !== "completed" || !response.video?.url) {
      throw new Error(
        `Higgsfield generation did not complete — status: ${response.status}`
      );
    }

    return {
      videoUrl: response.video.url,
      durationSeconds: opts.durationSeconds,
      model: "higgsfield-dop-turbo",
      costEstimateUsd: COST_PER_CLIP_USD,
    };
  }
}
