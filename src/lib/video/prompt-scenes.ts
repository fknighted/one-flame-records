import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AudioFeatures } from "@/lib/audio/analyze";

export interface SceneParams {
  stylePreset: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  genres: string[];
  lyrics?: string;
  creativeBrief?: string;
  referenceImageUrls?: string[];
}

const SceneSchema = z.object({
  start: z.number(),
  end: z.number(),
  prompt: z.string().min(10),
  aspectRatio: z.enum(["16:9", "9:16", "1:1"]),
});

export type Scene = z.infer<typeof SceneSchema>;

const ScenesSchema = z.object({
  scenes: z.array(SceneSchema).min(1),
});

function buildSystemPrompt(hasLyrics: boolean): string {
  return `You are a creative director for One Flame Records, a Jamaican record label based in Montego Bay.
You write cinematic scene descriptions for AI-generated music videos.

Visual style guidelines:
- Earthy, warm tones — ochre, deep greens, amber, rich browns
- Jamaican landscapes: lush mountains, coastlines, Kingston streets, rural countryside
- Vintage film aesthetic — grain, warm light leaks, golden hour
- Human subjects should feel authentic, not commercial
- Roots reggae: slow meditative shots, nature, spirituality, community
- Dancehall: energetic, urban, vibrant, club/street environments
- Cinematic camera language: rack focus, slow push-ins, aerial drifts

Energy mapping:
- low energy → slow, contemplative, landscape or intimate shots
- mid energy → moderate movement, character-driven, transitional scenes
- high energy → dynamic movement, crowd energy, peak performance moments

Each scene prompt should be 2–3 sentences, specific and visual, referencing concrete imagery.${
    hasLyrics
      ? "\nWhen lyrics are provided, let them guide the imagery — reflect the meaning and mood of the words in each scene."
      : "\nDo NOT mention lyrics, specific song titles, or artist names in the prompts."
  }`;
}

function buildUserPrompt(audio: AudioFeatures, params: SceneParams): string {
  let prompt = `Generate scene descriptions for a music video with these characteristics:

Audio analysis:
- Duration: ${audio.durationSeconds.toFixed(1)} seconds
- BPM: ${audio.bpm}
- Sections: ${JSON.stringify(audio.sections)}

Artist style:
- Genres: ${params.genres.join(", ") || "reggae"}
- Visual direction: ${params.stylePreset}
- Aspect ratio: ${params.aspectRatio}`;

  if (params.lyrics) {
    prompt += `\n\nSong lyrics (use these to match visual scenes to the song's story and structure):\n${params.lyrics}`;
  }

  if (params.creativeBrief) {
    prompt += `\n\nDirector's notes:\n${params.creativeBrief}`;
  }

  prompt += `\n\nGenerate one scene per section. Each scene should match the energy level of its section.
Return the scenes array using the generate_scenes tool.`;

  return prompt;
}

async function callClaude(
  audio: AudioFeatures,
  params: SceneParams,
  previousError?: string
): Promise<Scene[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const textPrompt = buildUserPrompt(audio, params) +
    (previousError ? `\n\nPrevious output failed validation: ${previousError}. Please fix it.` : "");

  // Build user message content — text first, then reference images if provided
  type UserContent = Anthropic.TextBlockParam | Anthropic.ImageBlockParam;
  const userContent: UserContent[] = [{ type: "text", text: textPrompt }];

  if (params.referenceImageUrls?.length) {
    for (const url of params.referenceImageUrls) {
      userContent.push({ type: "image", source: { type: "url", url } });
    }
  }

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    system: buildSystemPrompt(!!params.lyrics),
    tools: [
      {
        name: "generate_scenes",
        description: "Output the array of video scenes",
        input_schema: {
          type: "object" as const,
          properties: {
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  start: { type: "number", description: "Start time in seconds" },
                  end: { type: "number", description: "End time in seconds" },
                  prompt: { type: "string", description: "Cinematic scene description" },
                  aspectRatio: { type: "string", enum: ["16:9", "9:16", "1:1"] },
                },
                required: ["start", "end", "prompt", "aspectRatio"],
              },
            },
          },
          required: ["scenes"],
        },
      },
    ],
    tool_choice: { type: "any" },
    messages: [{ role: "user", content: userContent }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not call the generate_scenes tool");
  }

  return ScenesSchema.parse(toolUse.input).scenes;
}

export async function generateScenePrompts(
  audio: AudioFeatures,
  params: SceneParams
): Promise<Scene[]> {
  try {
    return await callClaude(audio, params);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return callClaude(audio, params, errorMsg);
  }
}
