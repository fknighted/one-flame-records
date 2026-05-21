import type { ClipGenerator, ClipOptions, ClipPollResult, ClipResult } from "@/lib/video/types";

export class PikaGenerator implements ClipGenerator {
  name = "pika";

  async submitClip(_opts: ClipOptions): Promise<string> {
    throw new Error("PikaGenerator not implemented");
  }

  async checkClip(_taskId: string, _opts: ClipOptions): Promise<ClipPollResult> {
    throw new Error("PikaGenerator not implemented");
  }

  async generateClip(_opts: ClipOptions): Promise<ClipResult> {
    throw new Error("PikaGenerator not implemented");
  }
}
