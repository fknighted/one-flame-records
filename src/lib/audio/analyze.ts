import { parseBuffer } from "music-metadata";

export interface AudioFeatures {
  bpm: number;
  durationSeconds: number;
  sections: Array<{ start: number; end: number; energy: "low" | "mid" | "high" }>;
}

const SECONDS_PER_CLIP = 10;
const MIN_CLIPS = 4;
const MAX_CLIPS = 20;
const ENERGY_CYCLE: Array<"low" | "mid" | "high"> = ["low", "mid", "high", "mid"];

function buildSections(duration: number): AudioFeatures["sections"] {
  const count = Math.min(MAX_CLIPS, Math.max(MIN_CLIPS, Math.round(duration / SECONDS_PER_CLIP)));
  const partSize = duration / count;
  return Array.from({ length: count }, (_, i) => ({
    start: Math.round(i * partSize * 10) / 10,
    end: Math.round((i + 1) * partSize * 10) / 10,
    energy: ENERGY_CYCLE[i % ENERGY_CYCLE.length],
  }));
}

export async function analyzeAudio(audioUrl: string): Promise<AudioFeatures> {
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio (${response.status}): ${audioUrl}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const metadata = await parseBuffer(buffer);

  const durationSeconds = metadata.format.duration ?? 0;
  if (durationSeconds <= 0) {
    throw new Error("Could not determine audio duration");
  }

  // Use embedded BPM tag if present, otherwise default to 90 (reggae/dancehall midpoint)
  const bpm = metadata.common.bpm ?? 90;

  return {
    bpm,
    durationSeconds,
    sections: buildSections(durationSeconds),
  };
}
