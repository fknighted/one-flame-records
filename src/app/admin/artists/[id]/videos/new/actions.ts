"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

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
      },
    })
    .select("id")
    .single();

  if (jobError || !job) return { error: "Could not create video job." };

  await inngest.send({
    name: "video/generate.requested",
    data: { jobId: job.id },
  });

  redirect("/admin/jobs");
}
