"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string } | null;

export async function toggleVideoPublic(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const jobId = formData.get("job_id") as string;
  if (!jobId) return { error: "Invalid request." };

  const supabase = await createClient();

  // Session client: RLS ensures the artist can only see/update their own jobs
  const { data: job, error: fetchError } = await supabase
    .from("video_jobs")
    .select("id, is_public, status")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) return { error: "Video not found." };
  if (job.status !== "complete") return { error: "Only completed videos can be shared." };

  const { error: updateError } = await supabase
    .from("video_jobs")
    .update({ is_public: !job.is_public })
    .eq("id", jobId);

  if (updateError) return { error: `Failed to update: ${updateError.message}` };

  revalidatePath(`/portal/videos/${jobId}`);
  return null;
}
