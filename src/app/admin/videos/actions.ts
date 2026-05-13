"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | null;

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  // Already a bare ID (11 alphanumeric chars + hyphens/underscores)
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // youtu.be/ID or youtube.com/watch?v=ID or /embed/ID
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export async function createVideo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };

  const rawYouTube = (formData.get("youtube_id") as string)?.trim();
  const youtube_id = extractYouTubeId(rawYouTube ?? "");
  if (!youtube_id) return { error: "Enter a valid YouTube URL or video ID." };

  const artist_id = (formData.get("artist_id") as string)?.trim();
  if (!artist_id) return { error: "Artist is required." };

  const release_id = (formData.get("release_id") as string)?.trim() || null;
  const kind = (formData.get("kind") as string) ?? "official";
  const featured = formData.get("featured") === "true";
  const published_at =
    (formData.get("published_at") as string)?.trim() ||
    new Date().toISOString().slice(0, 10);

  const supabase = createServiceClient();
  const { error } = await supabase.from("videos").insert({
    title,
    youtube_id,
    artist_id,
    release_id,
    kind,
    featured,
    published_at,
  });

  if (error) return { error: `Failed to create video: ${error.message}` };

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}

export async function updateVideo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Video ID is missing." };

  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };

  const rawYouTube = (formData.get("youtube_id") as string)?.trim();
  const youtube_id = extractYouTubeId(rawYouTube ?? "");
  if (!youtube_id) return { error: "Enter a valid YouTube URL or video ID." };

  const artist_id = (formData.get("artist_id") as string)?.trim();
  if (!artist_id) return { error: "Artist is required." };

  const release_id = (formData.get("release_id") as string)?.trim() || null;
  const kind = (formData.get("kind") as string) ?? "official";
  const featured = formData.get("featured") === "true";
  const published_at = (formData.get("published_at") as string)?.trim();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("videos")
    .update({ title, youtube_id, artist_id, release_id, kind, featured, published_at })
    .eq("id", id);

  if (error) return { error: `Failed to update video: ${error.message}` };

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}
