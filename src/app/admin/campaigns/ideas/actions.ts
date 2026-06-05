"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const PILLARS = [
  { value: "artist_spotlight",  label: "Artist Spotlight",        description: "Feature an individual artist — their story, sound, and vision" },
  { value: "release_promotion", label: "Release Promotion",       description: "Push a new or catalogue release across platforms" },
  { value: "behind_the_music",  label: "Behind the Music",        description: "Studio sessions, creative process, day-in-the-life" },
  { value: "culture_roots",     label: "Culture & Roots",         description: "Jamaican music culture, history, and tradition" },
  { value: "fan_engagement",    label: "Fan Engagement",          description: "Q&As, polls, reposts, community moments" },
  { value: "label_news",        label: "Label News",              description: "Signings, milestones, events, announcements" },
] as const;

export type Pillar = typeof PILLARS[number]["value"];

export type Idea = {
  id: string;
  title: string;
  angle: string | null;
  pillar: string | null;
  source_type: string;
  suggested_platforms: string[];
  status: string;
  created_at: string;
};

export async function generateIdeas(): Promise<{ error?: string }> {
  await requireAdmin();
  if (!process.env.ANTHROPIC_API_KEY) return { error: "ANTHROPIC_API_KEY is not configured." };

  const supabase = createServiceClient();

  // Pull label context for richer ideas
  const [{ data: artists }, { data: releases }, { data: news }] = await Promise.all([
    supabase.from("artists").select("stage_name, genres, hometown").eq("status", "active").limit(10),
    supabase.from("releases").select("title, type, release_date").order("release_date", { ascending: false }).limit(5),
    supabase.from("news_posts").select("title, category").eq("is_published", true).order("published_at", { ascending: false }).limit(5),
  ]);

  const artistList = (artists ?? []).map(a => `${a.stage_name} (${(a.genres as string[] | null)?.join(", ") ?? "unknown genre"})`).join(", ");
  const releaseList = (releases ?? []).map(r => `"${r.title}" (${r.type})`).join(", ");
  const newsList = (news ?? []).map(n => `"${n.title}"`).join(", ");

  const pillarsDesc = PILLARS.map(p => `- ${p.label}: ${p.description}`).join("\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `You are a content strategist for One Flame Records, an independent reggae and dancehall label from Montego Bay, Jamaica. Generate specific, actionable campaign ideas that feel authentic to the label's voice — rooted in Jamaican culture, not generic music marketing.`,
    messages: [{
      role: "user",
      content: `Generate 8 campaign ideas for One Flame Records.

Label context:
- Artists: ${artistList || "roster not yet populated"}
- Recent releases: ${releaseList || "none yet"}
- Recent news: ${newsList || "none yet"}

Content pillars to draw from:
${pillarsDesc}

For each idea, return a JSON object with:
- "title": short, specific campaign title (not generic — reference real artists or releases where possible)
- "angle": 1–2 sentence creative direction explaining the specific angle and what makes it compelling
- "pillar": one of: artist_spotlight, release_promotion, behind_the_music, culture_roots, fan_engagement, label_news
- "source_type": what source material would power this campaign — one of: video, post, newsletter, text
- "suggested_platforms": array from ["instagram", "tiktok", "facebook"] — pick the best fit for this idea

Return ONLY a valid JSON array of 8 objects. No explanation or markdown.`,
    }],
  });

  const raw = msg.content
    .filter(b => b.type === "text")
    .map(b => (b as { type: "text"; text: string }).text)
    .join("")
    .trim();

  const jsonStr = raw.startsWith("[") ? raw : raw.slice(raw.indexOf("["));

  let ideas: {
    title: string;
    angle: string;
    pillar: string;
    source_type: string;
    suggested_platforms: string[];
  }[];

  try {
    ideas = JSON.parse(jsonStr);
  } catch {
    return { error: `Claude returned invalid JSON: ${raw.slice(0, 200)}` };
  }

  const rows = ideas.map(idea => ({
    title:               idea.title,
    angle:               idea.angle ?? null,
    pillar:              idea.pillar ?? null,
    source_type:         idea.source_type ?? "text",
    suggested_platforms: idea.suggested_platforms ?? [],
    status:              "draft",
  }));

  const { error } = await supabase.from("campaign_ideas").insert(rows);
  if (error) return { error: error.message };

  revalidatePath("/admin/campaigns/ideas");
  return {};
}

export async function dismissIdea(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("campaign_ideas").update({ status: "dismissed" }).eq("id", id);
  revalidatePath("/admin/campaigns/ideas");
}

export async function markExpanded(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("campaign_ideas").update({ status: "expanded" }).eq("id", id);
  revalidatePath("/admin/campaigns/ideas");
}
