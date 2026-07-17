"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendVideoGenerateRequest } from "@/lib/inngest/send";
import { jamaicaMonthStart } from "@/lib/bar/pos";

export type VideoRequestState = { error: string } | null;

// Conservative per-job cost estimate used for budget checks before generation.
// Actual cost is written back to video_jobs.cost_estimate_usd after assembly.
const PER_JOB_ESTIMATE_USD = 5;

async function checkBudget(): Promise<boolean> {
  const service = createServiceClient();

  // Fetch the configured monthly budget
  const { data: setting } = await service
    .from("settings")
    .select("value")
    .eq("key", "monthly_video_budget_usd")
    .single();

  const budgetUsd = Number(setting?.value ?? 100);

  // Sum cost_estimate_usd for jobs created this calendar month (Jamaica time)
  const monthStart = jamaicaMonthStart();

  const { data: jobs } = await service
    .from("video_jobs")
    .select("cost_estimate_usd")
    .gte("created_at", monthStart.toISOString());

  const spentUsd = (jobs ?? []).reduce(
    (sum, j) => sum + (Number(j.cost_estimate_usd) || PER_JOB_ESTIMATE_USD),
    0
  );

  return spentUsd + PER_JOB_ESTIMATE_USD <= budgetUsd;
}

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
    .select("artist_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) return { error: "No artist profile linked." };

  const assetId = formData.get("asset_id") as string;
  const stylePreset = formData.get("style_preset") as string;
  const aspectRatio = formData.get("aspect_ratio") as string;
  const model = formData.get("model") as string;
  const bypassBudget = formData.get("bypass_budget") === "1";

  if (!assetId) return { error: "Please select an asset." };

  // Budget check — admins can bypass
  const isAdmin = profile.role === "admin";
  if (!isAdmin && !bypassBudget) {
    const withinBudget = await checkBudget();
    if (!withinBudget) {
      return {
        error:
          "Video generation is paused this month — the label's budget has been reached. Contact the label to request more.",
      };
    }
  }

  // Verify asset belongs to this artist
  const { data: asset } = await supabase
    .from("assets")
    .select("id, title")
    .eq("id", assetId)
    .eq("artist_id", profile.artist_id)
    .single();

  if (!asset) return { error: "Asset not found." };

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

  // A missing event key is tolerated (the job stays pending and can be triggered
  // by the label). A genuine dispatch failure would leave a job that never runs,
  // so remove the row and let the artist retry rather than 500-ing.
  try {
    await sendVideoGenerateRequest(job.id);
  } catch {
    await createServiceClient().from("video_jobs").delete().eq("id", job.id);
    return {
      error:
        "We couldn't queue your video just now. Please try again in a moment.",
    };
  }

  redirect("/portal/videos");
}
