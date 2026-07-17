"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendVideoGenerateRequest } from "@/lib/inngest/send";
import type { ClipResult } from "@/lib/video/types";

export async function regenerateClip(jobId: string, clipIndex: number): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: job } = await supabase
    .from("video_jobs")
    .select("artist_id, source_asset_id, params")
    .eq("id", jobId)
    .single();

  if (!job) throw new Error("Job not found");

  const params = (job.params ?? {}) as Record<string, unknown>;

  // Single-clip regeneration only makes sense when the scene plan is stored:
  // the new job reuses params.scenes so the replacement clip matches the rest.
  // A pre-scenes job would re-plan every scene from scratch, producing a clip
  // that's visually inconsistent with the video — refuse instead.
  const scenes = params.scenes as unknown[] | undefined;
  if (!scenes?.length) {
    throw new Error(
      "This video predates stored scene data, so a single clip can't be regenerated without re-planning the whole video. Regenerate the full video instead."
    );
  }

  const generatedClips = [...((params.generatedClips as (ClipResult | null)[]) ?? [])];
  generatedClips[clipIndex] = null;

  const { data: newJob, error } = await supabase
    .from("video_jobs")
    .insert({
      artist_id: job.artist_id,
      source_asset_id: job.source_asset_id,
      status: "queued",
      params: JSON.parse(JSON.stringify({ ...params, generatedClips })),
    })
    .select("id")
    .single();

  if (error || !newJob) throw new Error(error?.message ?? "Could not create replacement job");

  // A missing event key is tolerated (the row exists, admin can trigger it
  // manually); any real dispatch failure re-throws so the admin sees it.
  await sendVideoGenerateRequest(newJob.id);

  redirect(`/admin/jobs/${newJob.id}`);
}
