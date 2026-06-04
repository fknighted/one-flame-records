"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | null;

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

// Returns a presigned upload URL + the resulting public URL.
// The browser uploads directly to Supabase — no file passes through the server.
export async function getVideoUploadUrl(
  filename: string,
  contentType: string
): Promise<{ signedUrl: string; publicUrl: string }> {
  const supabase = createServiceClient();
  const ext = filename.split(".").pop() ?? "mp4";
  const storagePath = `videos/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("public-media")
    .createSignedUploadUrl(storagePath);

  if (error || !data) throw new Error(`Could not create upload URL: ${error?.message}`);

  const { data: pub } = supabase.storage.from("public-media").getPublicUrl(storagePath);
  return { signedUrl: data.signedUrl, publicUrl: pub.publicUrl };
}

export async function createVideo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };

  const rawYouTube = (formData.get("youtube_id") as string)?.trim();
  const youtube_id = rawYouTube ? extractYouTubeId(rawYouTube) : null;
  const storage_url = (formData.get("storage_url") as string)?.trim() || null;

  if (!youtube_id && !storage_url) {
    return { error: "Provide a YouTube URL or upload a video file." };
  }

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
    title, youtube_id, storage_url, artist_id, release_id, kind, featured, published_at,
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
  const youtube_id = rawYouTube ? extractYouTubeId(rawYouTube) : null;
  const storage_url = (formData.get("storage_url") as string)?.trim() || null;

  const artist_id = (formData.get("artist_id") as string)?.trim();
  if (!artist_id) return { error: "Artist is required." };

  const release_id = (formData.get("release_id") as string)?.trim() || null;
  const kind = (formData.get("kind") as string) ?? "official";
  const featured = formData.get("featured") === "true";
  const published_at = (formData.get("published_at") as string)?.trim();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("videos")
    .update({ title, youtube_id, storage_url, artist_id, release_id, kind, featured, published_at })
    .eq("id", id);

  if (error) return { error: `Failed to update video: ${error.message}` };

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}
