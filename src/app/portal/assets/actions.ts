"use server";
import { invalidatePublicCatalog } from "@/lib/public-cache";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type AssetActionState = { error: string } | null;

import { verifyUpload } from "@/lib/uploads/verify";
import { deleteStoredAsset } from "@/lib/uploads/delete";

const AUDIO_KINDS = ["instrumental", "demo"];

export async function uploadAsset(
  _prev: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
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

  const kind = (formData.get("kind") as string) ?? "";
  const title = ((formData.get("title") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;
  const validKinds = ["instrumental", "demo", "reference_video", "reference_image"];
  if (!validKinds.includes(kind) || !title || title.length > 200 || (notes?.length ?? 0)>5000) return { error: "Enter a valid kind and title (up to 200 characters)." };
  let verified;
  try { verified = await verifyUpload(String(formData.get("upload_id") ?? ""), user.id, artistId, "asset"); }
  catch(error) { return { error: error instanceof Error ? error.message : "Could not verify upload." }; }
  const { upload, buffer } = verified;
  if(upload.kind !== kind) return { error: "The uploaded file kind has changed. Select the file again." };
  const file={ type:upload.mime_type, size:upload.size_bytes };
  let durationSeconds: number | null = null;
  if (AUDIO_KINDS.includes(kind)) {
    try {
      const { parseBuffer } = await import("music-metadata");
      const meta = await parseBuffer(new Uint8Array(buffer), { mimeType: file.type });
      durationSeconds =
        meta.format.duration != null ? Math.round(meta.format.duration) : null;
    } catch {
      // Non-fatal — leave duration null
    }
  }

  const {error:dbError}=await createServiceClient().rpc("finalize_asset_upload",{p_upload:upload.id,p_owner:user.id,p_title:title,p_notes:notes,p_duration:durationSeconds});
  if(dbError)return {error:dbError.message};

  invalidatePublicCatalog("artist");
  revalidatePath("/portal/assets");
  redirect("/portal/assets");
}

export async function updateAsset(
  assetId: string,
  _prev: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();
  if (!profile?.artist_id) return { error: "No artist profile." };

  const kind  = (formData.get("kind") as string) ?? "";
  const title = ((formData.get("title") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;

  const validKinds = ["instrumental", "demo", "reference_video", "reference_image"];
  if (!validKinds.includes(kind)) return { error: "Invalid kind." };
  if (!title) return { error: "Title is required." };

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("assets")
    .update({ kind, title, notes })
    .eq("id", assetId)
    .eq("artist_id", profile.artist_id);

  if (error) return { error: `Failed to update: ${error.message}` };

  invalidatePublicCatalog("artist");
  revalidatePath("/portal/assets");
  redirect("/portal/assets");
}

export async function deleteAsset(assetId: string): Promise<AssetActionState> {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();
  if (!profile?.artist_id) return { error: "No artist profile." };

  const serviceClient = createServiceClient();

  const { data: asset } = await serviceClient
    .from("assets")
    .select("storage_path")
    .eq("id", assetId)
    .eq("artist_id", profile.artist_id)
    .single();

  if (!asset) return { error: "Asset not found or access denied." };

  const result = await deleteStoredAsset(assetId, profile.artist_id);
  invalidatePublicCatalog("artist");
  revalidatePath("/portal/assets");
  return result;
}

export async function toggleAssetPublic(assetId: string, _formData: FormData): Promise<void> {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) return;

  const service = createServiceClient();
  const { data: asset } = await service
    .from("assets")
    .select("is_public")
    .eq("id", assetId)
    .eq("artist_id", profile.artist_id)
    .single();

  if (!asset) return;

  await service
    .from("assets")
    .update({ is_public: !asset.is_public })
    .eq("id", assetId);

  invalidatePublicCatalog("artist");
  revalidatePath("/portal/assets");
}
