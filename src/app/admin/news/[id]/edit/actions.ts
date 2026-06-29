"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uploadCover(file: File, postId: string): Promise<string> {
  const supabase = createServiceClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `news/${postId}/${crypto.randomUUID()}.${ext}`;

  const buffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from("public-media")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return data.publicUrl;
}

function parseFormData(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim() || slugify(title ?? "");
  const published_at_raw = (formData.get("published_at") as string)?.trim();

  return {
    title,
    slug,
    excerpt: (formData.get("excerpt") as string)?.trim() || null,
    body: (formData.get("body") as string) ?? "",
    category: (formData.get("category") as string) ?? "label",
    is_published: formData.get("is_published") === "true",
    published_at: published_at_raw || null,
  };
}

export async function updateNewsPost(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "Post ID is missing." };

  const fields = parseFormData(formData);
  if (!fields.title) return { error: "Title is required." };
  if (!fields.slug) return { error: "Slug is required." };

  const supabase = createServiceClient();

  let newCoverUrl: string | undefined;
  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    try {
      newCoverUrl = await uploadCover(coverFile, id);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  const { error } = await supabase
    .from("news_posts")
    .update(
      newCoverUrl !== undefined ? { ...fields, cover_url: newCoverUrl } : fields
    )
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "That slug is already in use." };
    return { error: `Failed to update post: ${error.message}` };
  }

  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export { deleteNewsPost } from "../../actions";
