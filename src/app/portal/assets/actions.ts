"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export type AssetActionState = { error: string } | null;

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
  const file = formData.get("file") as File | null;

  const validKinds = ["instrumental", "demo", "reference_video", "reference_image"];
  if (!validKinds.includes(kind)) return { error: "Invalid asset kind." };
  if (!title) return { error: "Title is required." };
  if (!file || file.size === 0) return { error: "Please select a file." };
  if (file.size > 10 * 1024 * 1024) return { error: "File must be under 10 MB." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = `${artistId}/${crypto.randomUUID()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const serviceClient = createServiceClient();
  const { error: storageError } = await serviceClient.storage
    .from("private-assets")
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (storageError) return { error: `Upload failed: ${storageError.message}` };

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

  const { error: dbError } = await sessionClient.from("assets").insert({
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
    await serviceClient.storage.from("private-assets").remove([storagePath]);
    return { error: `Failed to save asset: ${dbError.message}` };
  }

  revalidatePath("/portal/assets");
  redirect("/portal/assets");
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

  revalidatePath("/portal/assets");
}
