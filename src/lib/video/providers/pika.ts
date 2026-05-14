import type { ClipGenerator, ClipOptions, ClipResult } from "@/lib/video/types";

export class PikaGenerator implements ClipGenerator {
  name = "pika";

  async generateClip(_opts: ClipOptions): Promise<ClipResult> {
    throw new Error("PikaGenerator not implemented");
  }
}
