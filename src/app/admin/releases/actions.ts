"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | null;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uploadCover(file: File, releaseId: string): Promise<string> {
  const supabase = createServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `covers/${releaseId}/${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("public-media")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return data.publicUrl;
}

function parseFormData(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(title ?? "");
  const streaming_links = {
    spotify: (formData.get("streaming_spotify") as string) ?? "",
    apple_music: (formData.get("streaming_apple_music") as string) ?? "",
    tidal: (formData.get("streaming_tidal") as string) ?? "",
    youtube_music: (formData.get("streaming_youtube_music") as string) ?? "",
  };

  return {
    title,
    slug,
    artist_id: (formData.get("artist_id") as string)?.trim(),
    type: (formData.get("type") as string) ?? "single",
    release_date: (formData.get("release_date") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    featured: formData.get("featured") === "true",
    streaming_links,
  };
}

export async function createRelease(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const fields = parseFormData(formData);
  if (!fields.title) return { error: "Title is required." };
  if (!fields.artist_id) return { error: "Artist is required." };
  if (!fields.release_date) return { error: "Release date is required." };

  const supabase = createServiceClient();
  const releaseId = crypto.randomUUID();

  let cover_url = "";
  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    try {
      cover_url = await uploadCover(coverFile, releaseId);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const { error } = await supabase.from("releases").insert({
    id: releaseId,
    ...fields,
    cover_url,
  });

  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    return { error: `Failed to create release: ${error.message}` };
  }

  revalidatePath("/admin/releases");
  redirect("/admin/releases");
}

export async function deleteRelease(releaseId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("releases").delete().eq("id", releaseId);
  revalidatePath("/admin/releases");
}

export async function updateRelease(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Release ID is missing." };

  const fields = parseFormData(formData);
  if (!fields.title) return { error: "Title is required." };
  if (!fields.artist_id) return { error: "Artist is required." };
  if (!fields.release_date) return { error: "Release date is required." };

  const supabase = createServiceClient();

  let newCoverUrl: string | undefined;
  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    try {
      newCoverUrl = await uploadCover(coverFile, id);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const { error } = await supabase
    .from("releases")
    .update(
      newCoverUrl !== undefined ? { ...fields, cover_url: newCoverUrl } : fields
    )
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    return { error: `Failed to update release: ${error.message}` };
  }

  revalidatePath("/admin/releases");
  redirect("/admin/releases");
}
