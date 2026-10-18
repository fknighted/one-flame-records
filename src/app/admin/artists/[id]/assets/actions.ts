"use server";
import { invalidatePublicCatalog } from "@/lib/public-cache";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type AssetActionState = { error: string } | null;

import { verifyUpload } from "@/lib/uploads/verify";
import { deleteStoredAsset } from "@/lib/uploads/delete";
import { currentUserId } from "@/lib/auth";
export async function uploadAssetForArtist(artistId: string, _prev: AssetActionState, data: FormData): Promise<AssetActionState> {
 await requireAdmin(); const owner=await currentUserId(); if(!owner) return {error:"Not authenticated."};
 const title=String(data.get("title")??"").trim(); const notes=String(data.get("notes")??"").trim();
 if(!title || title.length>200 || notes.length>5000) return {error:"Enter a title up to 200 characters and notes up to 5,000 characters."};
 try {
  const {upload}=await verifyUpload(String(data.get("upload_id")??""),owner,artistId,"asset");
  const {error}=await createServiceClient().rpc("finalize_asset_upload",{p_upload:upload.id,p_owner:owner,p_title:title,p_notes:notes||null,p_duration:null});
  if(error) return {error:error.message};
 }catch(error){return {error:error instanceof Error?error.message:"Upload could not be saved."};}
 revalidatePath(`/admin/artists/${artistId}/assets`);return null;
}

export async function toggleAssetPublic(assetId: string, _formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: asset } = await supabase
    .from("assets")
    .select("is_public, artist_id")
    .eq("id", assetId)
    .single();

  if (!asset) return;

  await supabase
    .from("assets")
    .update({ is_public: !asset.is_public })
    .eq("id", assetId);

  invalidatePublicCatalog("artist");
  revalidatePath(`/admin/artists/${asset.artist_id}/assets`);
}

export async function deleteAsset(assetId: string, _formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: asset } = await supabase
    .from("assets")
    .select("storage_path, artist_id")
    .eq("id", assetId)
    .single();

  if (asset) {
    const result = await deleteStoredAsset(assetId,asset.artist_id);
    if(result) throw new Error(result.error);
    invalidatePublicCatalog("artist");
  revalidatePath(`/admin/artists/${asset.artist_id}/assets`);
  }
}
