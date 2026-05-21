import type { ClipGenerator, ClipOptions, ClipPollResult, ClipResult } from "@/lib/video/types";

export class RunwayGenerator implements ClipGenerator {
  name = "runway";

  async submitClip(_opts: ClipOptions): Promise<string> {
    throw new Error("RunwayGenerator not implemented");
  }

  async checkClip(_taskId: string, _opts: ClipOptions): Promise<ClipPollResult> {
    throw new Error("RunwayGenerator not implemented");
  }

  async generateClip(_opts: ClipOptions): Promise<ClipResult> {
    throw new Error("RunwayGenerator not implemented");
  }
}
