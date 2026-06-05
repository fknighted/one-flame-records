"use server";

import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES     = 5 * 1024 * 1024; // 5 MB

export type GenerateImageResult =
  | { url: string; error?: never }
  | { error: string; url?: never };

export type ReferenceImage = {
  id: string;
  title: string;
  storage_path: string;
  signed_url: string;
};

// gpt-image-1 sizes
const IMAGE_SIZES = {
  square:    "1024x1024",
  landscape: "1536x1024",
  portrait:  "1024x1536",
} as const;

export async function getArtistReferenceImages(artistId: string): Promise<ReferenceImage[]> {
  const supabase = createServiceClient();

  const { data: assets } = await supabase
    .from("assets")
    .select("id, title, storage_path")
    .eq("artist_id", artistId)
    .eq("kind", "reference_image")
    .order("created_at", { ascending: false });

  if (!assets?.length) return [];

  // Generate signed URLs for display (10-minute expiry — just for browsing)
  const withUrls = await Promise.all(
    assets.map(async (a) => {
      const { data } = await supabase.storage
        .from("private-assets")
        .createSignedUrl(a.storage_path, 600);
      return {
        id: a.id,
        title: a.title,
        storage_path: a.storage_path,
        signed_url: data?.signedUrl ?? "",
      };
    })
  );

  return withUrls.filter((r) => r.signed_url);
}

export async function generateImage(formData: FormData): Promise<GenerateImageResult> {
  await requireAdmin();

  const prompt        = (formData.get("prompt") as string)?.trim();
  const size          = (formData.get("size") as string) ?? "square";
  const referenceMode = (formData.get("reference_mode") as string) ?? "none";
  const assetPath     = (formData.get("reference_asset_path") as string) ?? "";
  const uploadedFile  = formData.get("reference_image") as File | null;

  if (!prompt) return { error: "Prompt is required." };
  if (!process.env.OPENAI_API_KEY) return { error: "OPENAI_API_KEY is not configured." };

  // Validate uploaded reference image
  if (uploadedFile && uploadedFile.size > 0) {
    if (uploadedFile.size > MAX_UPLOAD_BYTES) return { error: "Reference image must be under 5 MB." };
    if (!ALLOWED_IMAGE_TYPES.includes(uploadedFile.type)) return { error: "Reference image must be PNG, JPEG, WebP, or GIF." };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const imageSize = IMAGE_SIZES[size as keyof typeof IMAGE_SIZES] ?? "1024x1024";

  let outputBuffer: Buffer;

  // ── With reference image — use images.edit() ──────────────────────────────
  if (referenceMode !== "none") {
    let refBuffer: Buffer;

    if (referenceMode === "asset" && assetPath) {
      // Fetch reference image from private-assets storage
      const supabase = createServiceClient();
      const { data: signed } = await supabase.storage
        .from("private-assets")
        .createSignedUrl(assetPath, 120);

      if (!signed?.signedUrl) return { error: "Could not access reference image." };

      try {
        const res = await fetch(signed.signedUrl);
        refBuffer = Buffer.from(await res.arrayBuffer());
      } catch {
        return { error: "Failed to download reference image." };
      }
    } else if (referenceMode === "upload" && uploadedFile && uploadedFile.size > 0) {
      refBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    } else {
      return { error: "No reference image provided." };
    }

    try {
      const ab = refBuffer.buffer.slice(refBuffer.byteOffset, refBuffer.byteOffset + refBuffer.byteLength) as ArrayBuffer;
      const refFile = new File([ab], "reference.png", { type: "image/png" });
      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: refFile,
        prompt,
        size: imageSize as "1024x1024" | "1536x1024" | "1024x1536",
        quality: "high",
        n: 1,
      });
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) return { error: "No image data returned from OpenAI." };
      outputBuffer = Buffer.from(b64, "base64");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Image generation failed: ${msg}` };
    }

  // ── No reference — use images.generate() ──────────────────────────────────
  } else {
    try {
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: imageSize as "1024x1024" | "1536x1024" | "1024x1536",
        quality: "high",
        n: 1,
      });
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) return { error: "No image data returned from OpenAI." };
      outputBuffer = Buffer.from(b64, "base64");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { error: `Image generation failed: ${msg}` };
    }
  }

  // ── Upload result to Supabase ──────────────────────────────────────────────
  const supabase = createServiceClient();
  const path = `ai-generated/${crypto.randomUUID()}.png`;
  const { error: uploadErr } = await supabase.storage
    .from("public-media")
    .upload(path, outputBuffer, { contentType: "image/png", upsert: false });

  if (uploadErr) return { error: `Storage upload failed: ${uploadErr.message}` };

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  const publicUrl = data.publicUrl;

  // Record in library (fire-and-forget — don't fail generation if this errors)
  const purposeField = (formData.get("purpose") as string) || "standalone";
  try {
    await supabase.from("ai_generated_images").insert({ url: publicUrl, prompt, purpose: purposeField });
  } catch { /* non-critical */ }

  return { url: publicUrl };
}

export async function applyImageToArtist(imageUrl: string, artistId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("artists").update({ photo_url: imageUrl }).eq("id", artistId);
  if (error) return { error: error.message };
  revalidatePath("/admin/artists");
  revalidatePath(`/admin/artists/${artistId}/edit`);
  return {};
}

export async function applyImageToRelease(imageUrl: string, releaseId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("releases").update({ cover_url: imageUrl }).eq("id", releaseId);
  if (error) return { error: error.message };
  revalidatePath("/admin/releases");
  revalidatePath(`/admin/releases/${releaseId}/edit`);
  return {};
}

export async function applyImageToNews(imageUrl: string, postId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.from("news_posts").update({ cover_url: imageUrl }).eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${postId}/edit`);
  return {};
}
