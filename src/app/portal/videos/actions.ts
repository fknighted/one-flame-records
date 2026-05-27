"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function toggleVideoPublic(jobId: string, _formData: FormData): Promise<void> {
  const sessionClient = await createClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("artist_id")
    .eq("id", user.id)
    .single();

  if (!profile?.artist_id) return;

  const service = createServiceClient();
  const { data: job } = await service
    .from("video_jobs")
    .select("is_public")
    .eq("id", jobId)
    .eq("artist_id", profile.artist_id)
    .single();

  if (!job) return;

  await service
    .from("video_jobs")
    .update({ is_public: !job.is_public })
    .eq("id", jobId);

  revalidatePath("/portal/videos");
}
