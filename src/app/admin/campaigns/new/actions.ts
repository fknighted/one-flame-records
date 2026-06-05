"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function createCampaign(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const title          = (formData.get("title") as string)?.trim();
  const source_type    = (formData.get("source_type") as string) ?? "text";
  const source_content = (formData.get("source_content") as string)?.trim();
  const platforms      = formData.getAll("platforms") as string[];
  const piecesPerPlatform = parseInt((formData.get("pieces_per_platform") as string) ?? "2", 10);
  const video_mode     = (formData.get("video_mode") as string) ?? "script";

  if (!title)          return { error: "Title is required." };
  if (!source_content) return { error: "Source content is required." };
  if (!platforms.length) return { error: "Select at least one platform." };

  const supabase = createServiceClient();
  const { data: campaign, error } = await supabase
    .from("content_campaigns")
    .insert({ title, source_type, source_content, status: "draft" })
    .select("id")
    .single();

  if (error || !campaign) return { error: `Failed to create campaign: ${error?.message}` };

  await inngest.send({
    name: "campaign/generate.requested",
    data: {
      campaignId: campaign.id,
      platforms,
      piecesPerPlatform,
      video_mode,
    },
  });

  revalidatePath("/admin/campaigns");
  redirect(`/admin/campaigns/${campaign.id}`);
}
