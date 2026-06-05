"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type CopyResult =
  | { text: string; error?: never }
  | { error: string; text?: never };

const SYSTEM_PROMPT = `You are a copywriter for One Flame Records, an independent reggae and dancehall label based in Montego Bay, Jamaica.

Voice and tone:
- Authentic, grounded, and proud of Jamaican culture
- Evokes roots, tradition, and the real spirit of the music
- Warm but not corporate — you speak like a person who loves the music
- Never generic. Every piece of copy should feel specific to this artist or this release.
- Short sentences. Direct. Vivid.

Style notes:
- Avoid clichés like "groundbreaking" or "game-changing"
- Use present tense when describing artists
- For bios: lead with what makes this artist distinctive
- For release descriptions: lead with the feeling or sound, not the format
- For news posts: write like a journalist who loves the music, not a press release
- For social captions: conversational, culturally grounded, no hashtag spam

Always write in English. Keep word count tight — say more with less.`;

const PURPOSE_PROMPTS: Record<string, (ctx: string) => string> = {
  artist_bio: (ctx) =>
    `Write a compelling artist bio for ${ctx || "a reggae/dancehall artist on One Flame Records"}. Aim for 120–200 words. Lead with what makes them distinctive.`,

  release_description: (ctx) =>
    `Write a release description for ${ctx || "a reggae/dancehall release on One Flame Records"}. Aim for 80–140 words. Lead with the feeling of the music, not the format.`,

  news_post: (ctx) =>
    `Write a short news post for the One Flame Records website${ctx ? ` about: ${ctx}` : ""}. Aim for 200–350 words. Write like a journalist who loves the music.`,

  social_caption: (ctx) =>
    `Write a social media caption for One Flame Records${ctx ? ` about: ${ctx}` : ""}. Keep it under 60 words. Conversational and culturally grounded.`,
};

export async function generateCopy(formData: FormData): Promise<CopyResult> {
  await requireAdmin();

  const purpose  = (formData.get("purpose") as string) ?? "artist_bio";
  const artistId = (formData.get("artist_id") as string) ?? "";
  const extraCtx = (formData.get("notes") as string)?.trim() ?? "";

  if (!process.env.ANTHROPIC_API_KEY) return { error: "ANTHROPIC_API_KEY is not configured." };

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Fetch artist / release context from DB if provided
  let contextLabel = extraCtx;
  if (artistId) {
    const supabase = createServiceClient();
    const { data: artist } = await supabase
      .from("artists")
      .select("stage_name, bio, hometown, genres")
      .eq("id", artistId)
      .single();

    if (artist) {
      const parts = [`Artist: ${artist.stage_name}`];
      if (artist.hometown) parts.push(`Hometown: ${artist.hometown}`);
      if (artist.genres?.length) parts.push(`Genres: ${(artist.genres as string[]).join(", ")}`);
      if (artist.bio) parts.push(`Existing bio (for context): ${artist.bio}`);
      if (extraCtx) parts.push(`Additional notes: ${extraCtx}`);
      contextLabel = parts.join("\n");
    }
  }

  const promptFn = PURPOSE_PROMPTS[purpose] ?? PURPOSE_PROMPTS.artist_bio;
  const userPrompt = promptFn(contextLabel);

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n\n")
      .trim();

    return { text };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Copy generation failed: ${msg}` };
  }
}
