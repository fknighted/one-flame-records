import OpenAI from "openai";
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
  referenceImageId: z.string().optional(),
});

export type Scene = z.infer<typeof SceneSchema>;

const ScenesSchema = z.object({
  scenes: z.array(SceneSchema).min(1),
});

function buildSystemPrompt(hasLyrics: boolean): string {
  return `You are a creative director for One Flame Records, a Jamaican record label based in Montego Bay.
You write cinematic scene descriptions for AI video generation (Kling model).

CRITICAL CONSTRAINT — no text in prompts:
The video model cannot render readable text. Any mention of words, letters, subtitles, typography, or text appearing on screen will produce garbled visual artifacts. Every prompt must be purely cinematic — camera, subject, action, location, light. Never describe text, titles, captions, or written elements of any kind.

Cultural authenticity — mandatory for every scene:
- Every human subject is a Jamaican person. Describe them through visual specifics: skin tones ranging from deep ebony and dark brown through warm caramel; authentic Jamaican hairstyles (locs, braids, afros, fades, twists); and genuine Jamaican dress — dancehall streetwear, Rastafarian earth tones, rural and coastal clothing.
- Root every scene in Jamaican cultural geography and community: Kingston yards and streets, Montego Bay coastline, Blue Mountain foothills, sound-system setups, dancehall venues, rural markets.
- In each scene prompt, describe subjects by their visible appearance and cultural setting — not by racial or ethnic labels. Write "a Jamaican man with deep brown skin and locs" rather than any group designation.

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

Style-specific guidance:
- "Lyric video": treat the lyrics as a visual narrative — translate the emotional content and story into purely visual scenes using symbolic imagery, colour, and movement. Do NOT describe text, words, or typography on screen.
- "Abstract visualizer": describe non-literal visuals — fluid light trails, colour gradients shifting with energy, particle bursts, organic textures reacting to the beat.

Prompt format: write 1–2 tight, cinematographic sentences per scene. Lead with the camera movement and main subject, then add location and light. Be specific and concrete. Do not write creative prose — write prompts the video model can follow.${
    hasLyrics
      ? "\n\nLyrics are provided — treat them as the PRIMARY structural guide. Map each distinct lyrical section (verse, chorus, bridge, hook) to one or more scenes. The scene's imagery must directly visualise what the specific lyrics describe — the people, places, actions, and emotions named in those words. Do NOT default to generic Jamaican landscapes when the lyrics name specific scenes. If the lyrics say \"stand by the river\" that scene should show a river; if they say \"dancehall tonight\" show a dancehall. Follow the song's narrative arc from first scene to last."
      : "\nDo NOT mention lyrics, specific song titles, or artist names in the prompts."
  }`;
}

function buildUserPrompt(audio: AudioFeatures, params: SceneParams): string {
  const genreList = params.genres.filter(Boolean).join(", ") || "reggae";
  let prompt = `Generate scene descriptions for a music video with these characteristics:

Audio analysis:
- Duration: ${audio.durationSeconds.toFixed(1)} seconds
- BPM: ${audio.bpm}
- Sections: ${JSON.stringify(audio.sections)}

Artist style:
- Genres: ${genreList}
- Visual direction: ${params.stylePreset}
- Aspect ratio: ${params.aspectRatio}`;

  if (params.lyrics) {
    prompt += `\n\nSong lyrics (use these to match visual scenes to the song's story and structure):\n${params.lyrics}`;
  }

  if (params.creativeBrief) {
    prompt += `\n\nDirector's notes:\n${params.creativeBrief}`;
  }

  prompt += `\n\nGenerate one scene per section. Each scene should match the energy level of its section.
Return the scenes array using the generate_scenes function.`;

  return prompt;
}

async function callOpenAI(
  audio: AudioFeatures,
  params: SceneParams,
  previousError?: string
): Promise<Scene[]> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const textPrompt =
    buildUserPrompt(audio, params) +
    (previousError ? `\n\nPrevious output failed validation: ${previousError}. Please fix it.` : "");

  // Build user message content — text first, then reference images if provided
  type ImageUrlBlock = { type: "image_url"; image_url: { url: string } };
  type TextBlock = { type: "text"; text: string };
  const userContent: (TextBlock | ImageUrlBlock)[] = [{ type: "text", text: textPrompt }];

  if (params.referenceImageUrls?.length) {
    for (const url of params.referenceImageUrls) {
      userContent.push({ type: "image_url", image_url: { url } });
    }
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      { role: "system", content: buildSystemPrompt(!!params.lyrics) },
      { role: "user", content: userContent },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "generate_scenes",
          description: "Output the array of video scenes",
          parameters: {
            type: "object",
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
      },
    ],
    tool_choice: { type: "function", function: { name: "generate_scenes" } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("OpenAI did not call the generate_scenes function");
  }

  const data = JSON.parse(toolCall.function.arguments);
  return ScenesSchema.parse(data).scenes;
}

export async function generateScenePrompts(
  audio: AudioFeatures,
  params: SceneParams
): Promise<Scene[]> {
  try {
    return await callOpenAI(audio, params);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return callOpenAI(audio, params, errorMsg);
  }
}
