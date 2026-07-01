"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type BrandSettingsState = { error: string } | { success: true } | null;

// Returns a presigned upload URL for a brand clip.
// The browser uploads directly; only the resulting public URL is sent back to the server.
export async function getBrandClipUploadUrl(
  filename: string,
  contentType: string
): Promise<{ signedUrl: string; publicUrl: string }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const ext = filename.split(".").pop() ?? "mp4";
  const storagePath = `brand/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("public-media")
    .createSignedUploadUrl(storagePath);
  if (error || !data) throw new Error(`Could not create upload URL: ${error?.message}`);

  const { data: pub } = supabase.storage.from("public-media").getPublicUrl(storagePath);
  return { signedUrl: data.signedUrl, publicUrl: pub.publicUrl };
}

export async function saveBrandClipUrl(
  key: "brand_intro_clip_url" | "brand_outro_clip_url",
  url: string
): Promise<BrandSettingsState> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: url as unknown as import("@/types/supabase").Json })
    .eq("key", key);
  if (error) return { error: `Could not save setting: ${error.message}` };
  revalidatePath("/admin/settings/brand");
  return { success: true };
}

export async function removeBrandClip(
  key: "brand_intro_clip_url" | "brand_outro_clip_url"
): Promise<BrandSettingsState> {
  await requireAdmin();
  const supabase = createServiceClient();
  // Set to empty string — getBrandClipUrls() treats "" as null
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value: "" as unknown as import("@/types/supabase").Json })
    .eq("key", key);
  if (error) return { error: `Could not clear setting: ${error.message}` };
  revalidatePath("/admin/settings/brand");
  return { success: true };
}
