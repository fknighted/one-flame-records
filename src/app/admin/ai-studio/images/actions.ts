"use server";

import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GenerateImageResult =
  | { url: string; error?: never }
  | { error: string; url?: never };

// gpt-image-1 sizes (replaced dall-e-3 in 2025)
const IMAGE_SIZES = {
  square:    "1024x1024",
  landscape: "1536x1024",
  portrait:  "1024x1536",
} as const;

export async function generateImage(formData: FormData): Promise<GenerateImageResult> {
  const prompt = (formData.get("prompt") as string)?.trim();
  const size = (formData.get("size") as string) ?? "square";

  if (!prompt) return { error: "Prompt is required." };
  if (!process.env.OPENAI_API_KEY) return { error: "OPENAI_API_KEY is not configured." };

  // Initialize inside the function so the env var is always current
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const imageSize = IMAGE_SIZES[size as keyof typeof IMAGE_SIZES] ?? "1024x1024";

  let buffer: Buffer;
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: imageSize as "1024x1024" | "1536x1024" | "1024x1536",
      quality: "high",
      n: 1,
    });
    // gpt-image-1 returns base64 directly — no temporary URL to fetch
    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return { error: "No image data returned from OpenAI." };
    buffer = Buffer.from(b64, "base64");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Image generation failed: ${msg}` };
  }

  const supabase = createServiceClient();
  const path = `ai-generated/${crypto.randomUUID()}.png`;
  const { error: uploadErr } = await supabase.storage
    .from("public-media")
    .upload(path, buffer, { contentType: "image/png", upsert: false });

  if (uploadErr) return { error: `Storage upload failed: ${uploadErr.message}` };

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function applyImageToArtist(imageUrl: string, artistId: string): Promise<{ error?: string }> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("artists").update({ photo_url: imageUrl }).eq("id", artistId);
  if (error) return { error: error.message };
  revalidatePath("/admin/artists");
  revalidatePath(`/admin/artists/${artistId}/edit`);
  return {};
}

export async function applyImageToRelease(imageUrl: string, releaseId: string): Promise<{ error?: string }> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("releases").update({ cover_url: imageUrl }).eq("id", releaseId);
  if (error) return { error: error.message };
  revalidatePath("/admin/releases");
  revalidatePath(`/admin/releases/${releaseId}/edit`);
  return {};
}

export async function applyImageToNews(imageUrl: string, postId: string): Promise<{ error?: string }> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("news_posts").update({ cover_url: imageUrl }).eq("id", postId);
  if (error) return { error: error.message };
  revalidatePath("/admin/news");
  revalidatePath(`/admin/news/${postId}/edit`);
  return {};
}
