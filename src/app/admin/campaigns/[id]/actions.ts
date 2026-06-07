"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
import { postToInstagram, postToFacebook } from "@/lib/social/meta";
import { postToTikTok } from "@/lib/social/tiktok";
import { requireAdmin } from "@/lib/auth";

export async function approvePiece(pieceId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: piece } = await supabase.from("content_pieces").select("campaign_id").eq("id", pieceId).single();
  await supabase.from("content_pieces").update({ status: "approved" }).eq("id", pieceId);
  if (piece) revalidatePath(`/admin/campaigns/${piece.campaign_id}`);
}

export async function rejectPiece(pieceId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: piece } = await supabase.from("content_pieces").select("campaign_id").eq("id", pieceId).single();
  await supabase.from("content_pieces").update({ status: "rejected" }).eq("id", pieceId);
  if (piece) revalidatePath(`/admin/campaigns/${piece.campaign_id}`);
}

export async function regeneratePiece(pieceId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: piece } = await supabase
    .from("content_pieces")
    .select("campaign_id, platform, content_type, video_mode, sort_order")
    .eq("id", pieceId)
    .single();
  if (!piece) return;

  await supabase.from("content_pieces").update({ status: "pending", caption: null, hashtags: null, image_url: null, video_script: null, error: null }).eq("id", pieceId);
  await inngest.send({ name: "campaign/regenerate-piece.requested", data: { pieceId, campaignId: piece.campaign_id } });
  revalidatePath(`/admin/campaigns/${piece.campaign_id}`);
}

export async function publishApproved(
  campaignId: string,
  platformOverrides: Record<string, string[]> = {}
): Promise<{ published: number; skipped: number; errors: string[] }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("status", "approved");

  if (!pieces?.length) return { published: 0, skipped: 0, errors: [] };

  let published = 0;
  let skipped   = 0;
  const errors: string[] = [];

  await supabase.from("content_campaigns").update({ status: "publishing" }).eq("id", campaignId);

  for (const piece of pieces) {
    const platforms = platformOverrides[piece.id]?.length
      ? platformOverrides[piece.id]
      : [piece.platform];

    await supabase.from("content_pieces").update({ status: "publishing" }).eq("id", piece.id);
    try {
      for (const platform of platforms) {
        if (platform === "instagram") {
          await postToInstagram(piece);
        } else if (platform === "facebook") {
          await postToFacebook(piece);
        } else if (platform === "tiktok") {
          await postToTikTok(piece);
        }
      }
      await supabase.from("content_pieces").update({ status: "published", published_at: new Date().toISOString() }).eq("id", piece.id);
      published++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await supabase.from("content_pieces").update({ status: "approved", error: msg }).eq("id", piece.id);
      errors.push(`${platforms.join("+")}: ${msg}`);
    }
  }

  // Update campaign status
  const { data: remaining } = await supabase.from("content_pieces").select("status").eq("campaign_id", campaignId);
  const allDone = remaining?.every((p) => p.status === "published" || p.status === "rejected") ?? false;
  await supabase.from("content_campaigns").update({ status: allDone ? "done" : "review" }).eq("id", campaignId);

  revalidatePath(`/admin/campaigns/${campaignId}`);
  return { published, skipped, errors };
}
