import { parseBuffer } from "music-metadata";

export interface AudioFeatures {
  bpm: number;
  durationSeconds: number;
  sections: Array<{ start: number; end: number; energy: "low" | "mid" | "high" }>;
}

// Divide track into 4 structural parts with a typical song energy curve
function buildSections(duration: number): AudioFeatures["sections"] {
  const energyMap: Array<"low" | "mid" | "high"> = ["low", "mid", "high", "mid"];
  const partSize = duration / 4;
  return energyMap.map((energy, i) => ({
    start: Math.round(i * partSize * 10) / 10,
    end: Math.round((i + 1) * partSize * 10) / 10,
    energy,
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
