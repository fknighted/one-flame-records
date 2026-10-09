"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Tables } from "@/types/supabase";

type Post = Tables<"news_posts">;
type ActionState = { error: string } | null;

const INPUT = "studio-field";
const LABEL = "studio-field-label";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewsForm({
  action,
  mode,
  post,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  post?: Post;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!post?.slug);
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false);
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.cover_url ?? null);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugEdited(true);
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  const publishedAt = post?.published_at
    ? new Date(post.published_at).toISOString().slice(0, 16)
    : "";

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      {mode === "edit" && <input type="hidden" name="id" value={post?.id} />}
      <input type="hidden" name="is_published" value={isPublished ? "true" : "false"} />

      {state?.error && (
        <p role="alert" className="studio-error">
          {state.error}
        </p>
      )}

      {/* Title */}
      <div>
        <label htmlFor="news-title" className={LABEL}>Title *</label>
        <input
          id="news-title"
          className={INPUT}
          name="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Post title"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="news-slug" className={LABEL}>Slug *</label>
        <input
          id="news-slug"
          className={INPUT}
          name="slug"
          value={slug}
          onChange={handleSlugChange}
          placeholder="url-friendly-slug"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="news-category" className={LABEL}>Category</label>
        <select id="news-category" className={INPUT} name="category" defaultValue={post?.category ?? "label"}>
          <option value="label">Label</option>
          <option value="release">Release</option>
          <option value="event">Event</option>
        </select>
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="news-excerpt" className={LABEL}>Excerpt</label>
        <textarea
          id="news-excerpt"
          className={INPUT}
          name="excerpt"
          rows={2}
          placeholder="Short summary shown in listings (optional)"
          defaultValue={post?.excerpt ?? ""}
        />
      </div>

      {/* Body */}
      <div>
        <label htmlFor="news-body" className={LABEL}>Body (Markdown)</label>
        <textarea
          id="news-body"
          className={`${INPUT} leading-relaxed`}
          name="body"
          rows={16}
          placeholder="Write the post body in Markdown…"
          defaultValue={post?.body ?? ""}
        />
      </div>

      {/* Cover image */}
      <div>
        <label htmlFor="news-cover" className={LABEL}>Cover image</label>
        {coverPreview && (
          <img
            src={coverPreview}
            alt="Cover preview"
            className="mb-3 h-32 w-auto object-cover border border-line"
          />
        )}
        <input
          id="news-cover"
          type="file"
          name="cover"
          accept="image/*"
          onChange={handleCoverChange}
          className="studio-field"
        />
      </div>

      {/* Published at */}
      <div>
        <label htmlFor="news-published-at" className={LABEL}>Publish date &amp; time</label>
        <input
          id="news-published-at"
          type="datetime-local"
          className={INPUT}
          name="published_at"
          defaultValue={publishedAt}
        />
      </div>

      {/* Is published */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setIsPublished((v) => !v)}
          className="inline-flex h-11 w-12 shrink-0 cursor-pointer items-center focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-yellow"
        >
          <span
            className={`relative inline-flex h-7 w-12 shrink-0 border-2 border-muted transition-colors ${
              isPublished ? "bg-green" : "bg-raised"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 bg-paper transition-transform ${
                isPublished ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
        <span className="text-paper">
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Saving…" : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
        <Link href="/admin/news" className="studio-btn studio-btn-quiet studio-btn-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
