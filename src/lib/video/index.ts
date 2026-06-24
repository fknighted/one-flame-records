import { KlingGenerator } from "@/lib/video/providers/kling";
import { KieGenerator } from "@/lib/video/providers/kie";
import { HiggsFieldGenerator } from "@/lib/video/providers/higgsfield";
import type { ClipGenerator } from "@/lib/video/types";

export function getClipGenerator(model?: string): ClipGenerator {
  const choice = model ?? process.env.DEFAULT_VIDEO_MODEL ?? "kling";
  switch (choice) {
    case "kie":         return new KieGenerator();
    case "kling":       return new KlingGenerator();
    case "higgsfield":  return new HiggsFieldGenerator();
    case "runway":
      throw new Error("Video provider 'runway' is not implemented. Set DEFAULT_VIDEO_MODEL to 'kie' or 'kling'.");
    case "pika":
      throw new Error("Video provider 'pika' is not implemented. Set DEFAULT_VIDEO_MODEL to 'kie' or 'kling'.");
    default: throw new Error(`Unknown video model: ${choice}`);
  }
}

export type { ClipGenerator, ClipOptions, ClipResult } from "@/lib/video/types";
