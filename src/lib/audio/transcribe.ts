import OpenAI from "openai";

export async function transcribeAudio(audioUrl: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const res = await fetch(audioUrl);
  if (!res.ok) throw new Error(`Failed to fetch audio for transcription (${res.status})`);

  const buffer = await res.arrayBuffer();
  const file = new File([buffer], "audio.mp3", { type: "audio/mpeg" });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await client.audio.transcriptions.create({
    model: "gpt-4o-transcribe",
    file,
    response_format: "text",
  });

  return typeof result === "string" ? result : null;
}
