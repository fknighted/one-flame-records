export type ClipPollResult = { done: false } | { done: true; result: ClipResult };

export interface ClipGenerator {
  name: string;
  generateClip(opts: ClipOptions): Promise<ClipResult>;
  submitClip(opts: ClipOptions): Promise<string>;
  checkClip(taskId: string, opts: ClipOptions): Promise<ClipPollResult>;
}

export interface ClipOptions {
  prompt: string;
  durationSeconds: number;      // typically 5–10
  aspectRatio: "16:9" | "9:16" | "1:1";
  referenceImage?: string;       // optional URL
  seed?: number;
}

export interface ClipResult {
  videoUrl: string;
  durationSeconds: number;
  model: string;                 // e.g. "kling-v2"
  costEstimateUsd: number;
}
