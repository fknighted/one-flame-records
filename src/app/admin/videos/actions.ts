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

async function uploadVideoFile(file: File, videoId: string): Promise<string> {
  const supabase = createServiceClient();
  const ext = file.name.split(".").pop() ?? "mp4";
  const storagePath = `videos/${videoId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("public-media")
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (error) throw new Error(`Video upload failed: ${error.message}`);

  const { data } = supabase.storage.from("public-media").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function createVideo(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = (formData.get("title") as string)?.trim();
  if (!title) return { error: "Title is required." };

  const rawYouTube = (formData.get("youtube_id") as string)?.trim();
  const youtube_id = rawYouTube ? extractYouTubeId(rawYouTube) : null;

  const videoFile = formData.get("video_file") as File | null;
  const hasFile = videoFile && videoFile.size > 0;

  if (!youtube_id && !hasFile) {
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

  // Insert first to get the ID (needed for storage path)
  const { data: video, error } = await supabase
    .from("videos")
    .insert({ title, youtube_id, artist_id, release_id, kind, featured, published_at })
    .select("id")
    .single();

  if (error || !video) return { error: `Failed to create video: ${error?.message}` };

  // Upload file and update storage_url if provided
  if (hasFile) {
    try {
      const storage_url = await uploadVideoFile(videoFile, video.id);
      await supabase.from("videos").update({ storage_url }).eq("id", video.id);
    } catch (e) {
      await supabase.from("videos").delete().eq("id", video.id);
      return { error: (e as Error).message };
    }
  }

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

  const videoFile = formData.get("video_file") as File | null;
  const hasFile = videoFile && videoFile.size > 0;

  const artist_id = (formData.get("artist_id") as string)?.trim();
  if (!artist_id) return { error: "Artist is required." };

  const release_id = (formData.get("release_id") as string)?.trim() || null;
  const kind = (formData.get("kind") as string) ?? "official";
  const featured = formData.get("featured") === "true";
  const published_at = (formData.get("published_at") as string)?.trim();

  const supabase = createServiceClient();

  let storage_url: string | undefined;
  if (hasFile) {
    try {
      storage_url = await uploadVideoFile(videoFile, id);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const { error } = await supabase
    .from("videos")
    .update({
      title, artist_id, release_id, kind, featured, published_at,
      youtube_id: youtube_id ?? null,
      ...(storage_url ? { storage_url } : {}),
    })
    .eq("id", id);
  if (error) return { error: `Failed to update video: ${error.message}` };

  revalidatePath("/admin/videos");
  redirect("/admin/videos");
}
