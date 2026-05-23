"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
import { transcribeAudio } from "@/lib/audio/transcribe";
import { analyzeAudio } from "@/lib/audio/analyze";
import { generateScenePrompts } from "@/lib/video/prompt-scenes";
import type { Scene } from "@/lib/video/prompt-scenes";

export type AdminVideoRequestState = { error: string } | null;

export async function requestVideoAsAdmin(
  artistId: string,
  _prev: AdminVideoRequestState,
  formData: FormData
): Promise<AdminVideoRequestState> {
  const assetId = formData.get("asset_id") as string;
  const stylePreset = formData.get("style_preset") as string;
  const aspectRatio = formData.get("aspect_ratio") as string;
  const model = (formData.get("model") as string) || undefined;
  const lyrics = (formData.get("lyrics") as string)?.trim() || undefined;
  const creativeBrief = (formData.get("creative_brief") as string)?.trim() || undefined;
  const refImageIdsRaw = formData.getAll("reference_image_ids") as string[];
  const referenceImageIds = refImageIdsRaw.filter(Boolean).length ? refImageIdsRaw.filter(Boolean) : undefined;

  if (!assetId) return { error: "Please select an asset." };

  const supabase = createServiceClient();

  // Verify the asset belongs to this artist
  const { data: asset } = await supabase
    .from("assets")
    .select("id, title")
    .eq("id", assetId)
    .eq("artist_id", artistId)
    .single();

  if (!asset) return { error: "Asset not found for this artist." };

  const { data: job, error: jobError } = await supabase
    .from("video_jobs")
    .insert({
      artist_id: artistId,
      source_asset_id: assetId,
      status: "queued",
      params: {
        stylePreset: stylePreset || "Vintage roots reggae performance",
        aspectRatio: aspectRatio || "16:9",
        ...(model ? { model } : {}),
        ...(lyrics ? { lyrics } : {}),
        ...(creativeBrief ? { creativeBrief } : {}),
        ...(referenceImageIds ? { referenceImageIds } : {}),
      },
    })
    .select("id")
    .single();

  if (jobError || !job) return { error: jobError?.message ?? "Could not create video job." };

  try {
    await inngest.send({
      name: "video/generate.requested",
      data: { jobId: job.id },
    });
  } catch {
    // Job row exists; event send failed (e.g. missing INNGEST_EVENT_KEY in prod).
    // Redirect anyway — the job can be triggered manually once keys are set.
  }

  redirect("/admin/jobs");
}

export async function transcribeAssetAction(
  assetId: string
): Promise<{ transcript: string } | { error: string }> {
  const supabase = createServiceClient();
  const { data: asset } = await supabase
    .from("assets")
    .select("storage_path")
    .eq("id", assetId)
    .single();

  if (!asset) return { error: "Asset not found" };

  const { data: signed } = await supabase.storage
    .from("private-assets")
    .createSignedUrl(asset.storage_path, 3600);

  if (!signed?.signedUrl) return { error: "Could not sign asset URL" };

  const transcript = await transcribeAudio(signed.signedUrl);
  if (!transcript) return { error: "Transcription failed — is OPENAI_API_KEY set?" };

  return { transcript };
}

export async function generateScriptAction(
  assetId: string,
  params: {
    stylePreset: string;
    aspectRatio: "16:9" | "9:16" | "1:1";
    lyrics?: string;
    creativeBrief?: string;
  }
): Promise<{ scenes: Scene[] } | { error: string }> {
  const supabase = createServiceClient();
  const { data: asset } = await supabase
    .from("assets")
    .select("storage_path")
    .eq("id", assetId)
    .single();

  if (!asset) return { error: "Asset not found" };

  const { data: signed } = await supabase.storage
    .from("private-assets")
    .createSignedUrl(asset.storage_path, 3600);

  if (!signed?.signedUrl) return { error: "Could not sign asset URL" };

  const audioFeatures = await analyzeAudio(signed.signedUrl);
  const scenes = await generateScenePrompts(audioFeatures, {
    stylePreset: params.stylePreset,
    aspectRatio: params.aspectRatio,
    genres: [],
    lyrics: params.lyrics,
    creativeBrief: params.creativeBrief,
  });

  return { scenes };
}
