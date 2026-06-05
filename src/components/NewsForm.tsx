"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Tables } from "@/types/supabase";

type Post = Tables<"news_posts">;
type ActionState = { error: string } | null;

const INPUT =
  "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";

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
        <p className="rounded bg-red-900/40 px-4 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      {/* Title */}
      <div>
        <label className={LABEL}>Title *</label>
        <input
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
        <label className={LABEL}>Slug *</label>
        <input
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
        <label className={LABEL}>Category</label>
        <select className={INPUT} name="category" defaultValue={post?.category ?? "label"}>
          <option value="label">Label</option>
          <option value="release">Release</option>
          <option value="event">Event</option>
        </select>
      </div>

      {/* Excerpt */}
      <div>
        <label className={LABEL}>Excerpt</label>
        <textarea
          className={INPUT}
          name="excerpt"
          rows={2}
          placeholder="Short summary shown in listings (optional)"
          defaultValue={post?.excerpt ?? ""}
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={LABEL} style={{ marginBottom: 0 }}>Body (Markdown)</label>
          {mode === "edit" && post?.id && (
            <Link
              href={`/admin/ai-studio/copy?purpose=news_post&return=/admin/news/${post.id}/edit`}
              className="text-xs text-ochre/60 hover:text-ochre transition-colors"
            >
              Draft with Claude →
            </Link>
          )}
        </div>
        <textarea
          className={`${INPUT} font-mono text-xs leading-relaxed`}
          name="body"
          rows={16}
          placeholder="Write the post body in Markdown…"
          defaultValue={post?.body ?? ""}
        />
      </div>

      {/* Cover image */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={LABEL} style={{ marginBottom: 0 }}>Cover image</label>
          {mode === "edit" && post?.id && (
            <Link
              href={`/admin/ai-studio/images?purpose=news_cover&return=/admin/news/${post.id}/edit`}
              className="text-xs text-ochre/60 hover:text-ochre transition-colors"
            >
              Generate with AI →
            </Link>
          )}
        </div>
        {coverPreview && (
          <img
            src={coverPreview}
            alt="Cover preview"
            className="mb-3 h-32 w-auto rounded object-cover"
          />
        )}
        <input
          type="file"
          name="cover"
          accept="image/*"
          onChange={handleCoverChange}
          className="text-sm text-bone/60 file:mr-3 file:rounded file:border-0 file:bg-oxblood file:px-3 file:py-1 file:text-xs file:text-bone file:cursor-pointer"
        />
      </div>

      {/* Published at */}
      <div>
        <label className={LABEL}>Publish date &amp; time</label>
        <input
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
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            isPublished ? "bg-forest" : "bg-bone/20"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-bone shadow transition-transform ${
              isPublished ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span className="text-sm text-bone/70">
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-oxblood px-5 py-2 text-sm font-medium text-bone hover:bg-oxblood/80 disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : mode === "create" ? "Create Post" : "Save Changes"}
        </button>
        <Link href="/admin/news" className="text-sm text-bone/40 hover:text-bone/70 transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
