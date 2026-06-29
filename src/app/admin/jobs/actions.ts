"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
import { requireAdmin } from "@/lib/auth";

export async function deleteJob(jobId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("video_jobs").delete().eq("id", jobId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/jobs");
}

export async function resetJob(jobId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase
    .from("video_jobs")
    .update({ status: "failed", error: "Manually reset by admin" })
    .eq("id", jobId);
  revalidatePath("/admin/jobs");
}

export async function cancelJob(jobId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  // Send Inngest cancel event so the running function exits at next step boundary
  await inngest.send({ name: "video/cancel.requested", data: { jobId } });

  // Mark the job as failed immediately so the UI updates right away
  await supabase
    .from("video_jobs")
    .update({
      status:       "failed",
      error:        "Cancelled by admin",
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .in("status", ["pending", "analyzing", "prompting", "generating", "assembling"]);

  revalidatePath("/admin/jobs");
}

export async function retryJob(jobId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: job } = await supabase
    .from("video_jobs")
    .select("artist_id, source_asset_id, params")
    .eq("id", jobId)
    .single();

  if (!job) return;

  const { data: newJob } = await supabase
    .from("video_jobs")
    .insert({
      artist_id: job.artist_id,
      source_asset_id: job.source_asset_id,
      status: "queued",
      params: job.params,
    })
    .select("id")
    .single();

  if (!newJob) return;

  await inngest.send({ name: "video/generate.requested", data: { jobId: newJob.id } });
  revalidatePath("/admin/jobs");
}
