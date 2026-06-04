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

function buildSections(duration: number, bpm: number): AudioFeatures["sections"] {
  const beatInterval = 60 / bpm;
  // Largest 4-beat multiple that fits in a 10s clip (e.g. 12 beats @ 90 BPM = 8.0s)
  const beatsPerClip = (Math.floor(10 / beatInterval / 4) * 4) || 4;
  const sectionDuration = beatsPerClip * beatInterval;

  const count = Math.min(MAX_CLIPS, Math.max(MIN_CLIPS, Math.round(duration / sectionDuration)));
  return Array.from({ length: count }, (_, i) => ({
    start: Math.round(i * sectionDuration * 100) / 100,
    end:   Math.round(Math.min((i + 1) * sectionDuration, duration) * 100) / 100,
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
    sections: buildSections(durationSeconds, bpm),
  };
}
