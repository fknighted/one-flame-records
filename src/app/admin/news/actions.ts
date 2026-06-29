"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function deleteNewsPost(postId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("news_posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/news");
}
