"use server";

import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type GenerateImageResult =
  | { url: string; error?: never }
  | { error: string; url?: never };

const DALL_E_SIZES = {
  square:    "1024x1024",
  landscape: "1792x1024",
  portrait:  "1024x1792",
} as const;

export async function generateImage(formData: FormData): Promise<GenerateImageResult> {
  const prompt = (formData.get("prompt") as string)?.trim();
  const size = (formData.get("size") as string) ?? "square";
  const quality = "hd";

  if (!prompt) return { error: "Prompt is required." };
  if (!process.env.OPENAI_API_KEY) return { error: "OPENAI_API_KEY is not configured." };

  const dalleSize = DALL_E_SIZES[size as keyof typeof DALL_E_SIZES] ?? "1024x1024";

  let tempUrl: string;
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: dalleSize as "1024x1024" | "1792x1024" | "1024x1792",
      quality,
      n: 1,
    });
    tempUrl = response.data?.[0]?.url ?? "";
    if (!tempUrl) return { error: "DALL-E returned no image URL." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `Image generation failed: ${msg}` };
  }

  // Download and re-upload to Supabase so we have a permanent URL
  let buffer: Buffer;
  try {
    const res = await fetch(tempUrl);
    buffer = Buffer.from(await res.arrayBuffer());
  } catch {
    return { error: "Failed to download generated image from OpenAI." };
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
