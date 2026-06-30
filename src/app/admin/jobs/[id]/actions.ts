"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { inngest } from "@/lib/inngest/client";
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

  try {
    await inngest.send({ name: "video/generate.requested", data: { jobId: newJob.id } });
  } catch {
    // event key missing — job row exists, can be triggered manually
  }

  redirect(`/admin/jobs/${newJob.id}`);
}
