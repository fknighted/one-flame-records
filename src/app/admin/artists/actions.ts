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

async function uploadPhoto(file: File, artistId: string): Promise<string> {
  const supabase = createServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `photos/${artistId}/${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("public-media")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Photo upload failed: ${error.message}`);

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return data.publicUrl;
}

function parseFormData(formData: FormData) {
  const stageName = (formData.get("stage_name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(stageName ?? "");
  const genresRaw = (formData.get("genres") as string) ?? "";
  const genres = genresRaw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const socials = {
    instagram: (formData.get("socials_instagram") as string) ?? "",
    twitter: (formData.get("socials_twitter") as string) ?? "",
    facebook: (formData.get("socials_facebook") as string) ?? "",
    youtube: (formData.get("socials_youtube") as string) ?? "",
  };
  const streaming = {
    spotify: (formData.get("streaming_spotify") as string) ?? "",
    apple_music: (formData.get("streaming_apple_music") as string) ?? "",
    tidal: (formData.get("streaming_tidal") as string) ?? "",
  };
  const featuredOrderRaw = formData.get("featured_order") as string;
  const featured_order =
    featuredOrderRaw?.trim() ? Number(featuredOrderRaw) : null;

  return {
    stage_name: stageName,
    slug,
    legal_name: (formData.get("legal_name") as string)?.trim() || null,
    bio: (formData.get("bio") as string) ?? "",
    hometown: (formData.get("hometown") as string)?.trim() || null,
    genres,
    status: (formData.get("status") as string) ?? "active",
    featured_order,
    socials,
    streaming,
  };
}

export async function createArtist(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const fields = parseFormData(formData);
  if (!fields.stage_name) return { error: "Stage name is required." };

  const supabase = createServiceClient();
  const artistId = crypto.randomUUID();

  let photo_url: string | null = null;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    try {
      photo_url = await uploadPhoto(photoFile, artistId);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const { error } = await supabase.from("artists").insert({
    id: artistId,
    ...fields,
    photo_url,
  });

  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    return { error: `Failed to create artist: ${error.message}` };
  }

  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}

export async function deleteArtist(artistId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("artists").delete().eq("id", artistId);
  revalidatePath("/admin/artists");
}

export async function activateArtist(artistId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("artists").update({ status: "active" }).eq("id", artistId);
  revalidatePath("/admin/artists");
}

export async function updateArtist(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = formData.get("id") as string;
  if (!id) return { error: "Artist ID is missing." };

  const fields = parseFormData(formData);
  if (!fields.stage_name) return { error: "Stage name is required." };

  const supabase = createServiceClient();

  let newPhotoUrl: string | undefined;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    try {
      newPhotoUrl = await uploadPhoto(photoFile, id);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const { error } = await supabase
    .from("artists")
    .update(
      newPhotoUrl !== undefined ? { ...fields, photo_url: newPhotoUrl } : fields
    )
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    return { error: `Failed to update artist: ${error.message}` };
  }

  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}
