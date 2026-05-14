import { KlingGenerator } from "@/lib/video/providers/kling";
import { HiggsFieldGenerator } from "@/lib/video/providers/higgsfield";
import { RunwayGenerator } from "@/lib/video/providers/runway";
import { PikaGenerator } from "@/lib/video/providers/pika";
import type { ClipGenerator } from "@/lib/video/types";

export function getClipGenerator(model?: string): ClipGenerator {
  const choice = model ?? process.env.DEFAULT_VIDEO_MODEL ?? "kling";
  switch (choice) {
    case "kling":       return new KlingGenerator();
    case "higgsfield":  return new HiggsFieldGenerator();
    case "runway":      return new RunwayGenerator();
    case "pika":        return new PikaGenerator();
    default: throw new Error(`Unknown video model: ${choice}`);
  }
}

export type { ClipGenerator, ClipOptions, ClipResult } from "@/lib/video/types";
