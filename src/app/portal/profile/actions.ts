"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type ProfileActionState =
  | { error: string }
  | { success: true }
  | null;

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

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  // Resolve artist ID from session — never trust a hidden input for this
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  const artistId = profile?.artist_id;
  if (!artistId) return { error: "No artist profile linked to this account." };

  const bio = (formData.get("bio") as string) ?? "";
  const socials = {
    instagram: (formData.get("socials_instagram") as string)?.trim() ?? "",
    twitter: (formData.get("socials_twitter") as string)?.trim() ?? "",
    facebook: (formData.get("socials_facebook") as string)?.trim() ?? "",
    youtube: (formData.get("socials_youtube") as string)?.trim() ?? "",
  };
  const streaming = {
    spotify: (formData.get("streaming_spotify") as string)?.trim() ?? "",
    apple_music: (formData.get("streaming_apple_music") as string)?.trim() ?? "",
    tidal: (formData.get("streaming_tidal") as string)?.trim() ?? "",
  };

  // Photo upload (service client for storage; row update uses session client for RLS)
  let newPhotoUrl: string | undefined;
  const photoFile = formData.get("photo") as File | null;
  if (photoFile && photoFile.size > 0) {
    try {
      newPhotoUrl = await uploadPhoto(photoFile, artistId);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const update = newPhotoUrl !== undefined
    ? { bio, socials, streaming, photo_url: newPhotoUrl }
    : { bio, socials, streaming };

  // Session client → RLS artists_update_self policy enforces artist can only update their own row
  const { error } = await sessionClient
    .from("artists")
    .update(update)
    .eq("id", artistId);

  if (error) return { error: `Failed to save: ${error.message}` };

  revalidatePath("/portal/profile");
  revalidatePath(`/artists`); // public site reflects the update
  return { success: true };
}
