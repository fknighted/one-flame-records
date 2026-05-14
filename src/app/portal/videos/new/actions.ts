"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";

export type VideoRequestState = { error: string } | null;

export async function requestVideo(
  _prev: VideoRequestState,
  formData: FormData
): Promise<VideoRequestState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) return { error: "No artist profile linked." };

  const assetId = formData.get("asset_id") as string;
  const stylePreset = formData.get("style_preset") as string;
  const aspectRatio = formData.get("aspect_ratio") as string;
  const model = formData.get("model") as string;

  if (!assetId) return { error: "Please select an asset." };

  // Verify asset belongs to this artist
  const { data: asset } = await supabase
    .from("assets")
    .select("id, title")
    .eq("id", assetId)
    .eq("artist_id", profile.artist_id)
    .single();

  if (!asset) return { error: "Asset not found." };

  // Create the job row via service client (pipeline steps use service client, so artist insert via session client is fine under RLS)
  const { data: job, error: jobError } = await supabase
    .from("video_jobs")
    .insert({
      artist_id: profile.artist_id,
      source_asset_id: assetId,
      status: "pending",
      params: {
        stylePreset: stylePreset || "Vintage roots reggae performance",
        aspectRatio: aspectRatio || "16:9",
        model: model || undefined,
      },
    })
    .select("id")
    .single();

  if (jobError || !job) return { error: "Could not create video job." };

  // Fire the Inngest event
  await inngest.send({
    name: "video/generate.requested",
    data: { jobId: job.id },
  });

  redirect("/portal/videos");
}
