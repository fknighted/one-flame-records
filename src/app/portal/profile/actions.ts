"use server";
import { invalidatePublicCatalog } from "@/lib/public-cache";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type ProfileActionState =
  | { error: string }
  | { success: true }
  | null;

import { verifyUpload } from "@/lib/uploads/verify";

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
  const uploadId = formData.get("upload_id");
  if (typeof uploadId === "string" && uploadId) {
    try {
      const {upload}=await verifyUpload(uploadId,user.id,artistId,"profile_photo");
      newPhotoUrl=createServiceClient().storage.from(upload.bucket).getPublicUrl(upload.path).data.publicUrl;
    } catch(error) { return {error:error instanceof Error?error.message:"Could not verify photo."}; }
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

  invalidatePublicCatalog("artist");
  revalidatePath("/portal/profile");
  revalidatePath(`/artists`); // public site reflects the update
  return { success: true };
}
