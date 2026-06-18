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

  const { data: job, error: fetchError } = await supabase
    .from("video_jobs")
    .select("id, is_public, status, artist_id")
    .eq("id", jobId)
    .single();

  if (fetchError || !job || !job.artist_id) return { error: "Video not found." };
  if (job.status !== "complete") return { error: "Only completed videos can be shared." };

  // Explicit artist_id filter as a belt-and-suspenders ownership check beyond RLS
  const { error: updateError } = await supabase
    .from("video_jobs")
    .update({ is_public: !job.is_public })
    .eq("id", jobId)
    .eq("artist_id", job.artist_id);

  if (updateError) return { error: "Could not update visibility." };

  revalidatePath(`/portal/videos/${jobId}`);
  revalidatePath("/portal/videos");
  revalidatePath("/videos");
  revalidatePath("/artists", "layout");
  return null;
}
