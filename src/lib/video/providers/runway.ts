import type { ClipGenerator, ClipOptions, ClipResult } from "@/lib/video/types";

export class RunwayGenerator implements ClipGenerator {
  name = "runway";

  async generateClip(_opts: ClipOptions): Promise<ClipResult> {
    throw new Error("RunwayGenerator not implemented");
  }
}
