"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function toggleJobPublic(jobId: string, artistId: string, _formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();

  const { data: job } = await supabase
    .from("video_jobs")
    .select("is_public")
    .eq("id", jobId)
    .eq("artist_id", artistId)
    .single();

  if (!job) return;

  await supabase
    .from("video_jobs")
    .update({ is_public: !job.is_public })
    .eq("id", jobId);

  revalidatePath(`/admin/artists/${artistId}/videos`);
}
