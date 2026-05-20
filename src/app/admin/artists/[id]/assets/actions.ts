"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export type AssetActionState = { error: string } | null;

const AUDIO_KINDS = ["instrumental", "demo"];
const VALID_KINDS = ["instrumental", "demo", "reference_video", "reference_image"];

export async function uploadAssetForArtist(
  artistId: string,
  _prev: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const kind = (formData.get("kind") as string) ?? "";
  const title = ((formData.get("title") as string) ?? "").trim();
  const notes = ((formData.get("notes") as string) ?? "").trim() || null;
  const file = formData.get("file") as File | null;

  if (!VALID_KINDS.includes(kind)) return { error: "Invalid asset kind." };
  if (!title) return { error: "Title is required." };
  if (!file || file.size === 0) return { error: "Please select a file." };
  if (file.size > 10 * 1024 * 1024) return { error: "File must be under 10 MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = `${artistId}/${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const supabase = createServiceClient();

  const { error: storageError } = await supabase.storage
    .from("private-assets")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (storageError) return { error: `Upload failed: ${storageError.message}` };

  let durationSeconds: number | null = null;
  if (AUDIO_KINDS.includes(kind)) {
    try {
      const { parseBuffer } = await import("music-metadata");
      const meta = await parseBuffer(new Uint8Array(buffer), { mimeType: file.type });
      durationSeconds = meta.format.duration != null ? Math.round(meta.format.duration) : null;
    } catch {
      // Non-fatal — leave duration null
    }
  }

  const { error: dbError } = await supabase.from("assets").insert({
    artist_id: artistId,
    kind,
    title,
    notes,
    storage_path: storagePath,
    mime_type: file.type,
    size_bytes: file.size,
    duration_seconds: durationSeconds,
  });

  if (dbError) {
    await supabase.storage.from("private-assets").remove([storagePath]);
    return { error: `Failed to save asset: ${dbError.message}` };
  }

  revalidatePath(`/admin/artists/${artistId}/assets`);
  return null;
}

export async function deleteAsset(assetId: string, _formData: FormData): Promise<void> {
  const supabase = createServiceClient();
  const { data: asset } = await supabase
    .from("assets")
    .select("storage_path, artist_id")
    .eq("id", assetId)
    .single();

  if (asset) {
    await supabase.storage.from("private-assets").remove([asset.storage_path]);
    await supabase.from("assets").delete().eq("id", assetId);
    revalidatePath(`/admin/artists/${asset.artist_id}/assets`);
  }
}
