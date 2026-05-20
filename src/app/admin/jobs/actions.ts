"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function deleteJob(jobId: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("video_jobs").delete().eq("id", jobId);
  revalidatePath("/admin/jobs");
}
