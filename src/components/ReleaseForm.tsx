"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/admin/releases/actions";

type Artist = { id: string; stage_name: string };

type InitialValues = {
  id?: string;
  title?: string;
  slug?: string;
  artist_id?: string;
  type?: string;
  release_date?: string;
  description?: string | null;
  featured?: boolean;
  cover_url?: string;
  streaming_links?: Record<string, string>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const INPUT =
  "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";
const SECTION_HEADING =
  "text-xs font-sans uppercase tracking-widest text-bone/35 pb-2 border-b border-bone/10";

export default function ReleaseForm({
  action,
  initialValues = {},
  mode,
  artists,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: InitialValues;
  mode: "create" | "edit";
  artists: Artist[];
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(initialValues.title ?? "");
  const [slug, setSlug] = useState(initialValues.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!initialValues.slug);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initialValues.cover_url ?? null
  );

  const streaming = initialValues.streaming_links ?? {};

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

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      {initialValues.id && (
        <input type="hidden" name="id" value={initialValues.id} />
      )}

      {state?.error && (
        <div className="bg-oxblood/20 border border-oxblood/50 rounded px-4 py-3 text-sm text-bone">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Basic Info</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Title *</label>
            <input
              name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>URL Slug *</label>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
              className={INPUT}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Artist *</label>
            <select
              name="artist_id"
              required
              defaultValue={initialValues.artist_id ?? ""}
              className={INPUT + " bg-ink"}
            >
              <option value="" disabled>
                Select artist…
              </option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.stage_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Type *</label>
            <select
              name="type"
              defaultValue={initialValues.type ?? "single"}
              className={INPUT + " bg-ink"}
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
              <option value="mixtape">Mixtape</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Release Date *</label>
            <input
              name="release_date"
              type="date"
              required
              defaultValue={initialValues.release_date ?? ""}
              className={INPUT + " bg-ink"}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="hidden"
                name="featured"
                value="false"
              />
              <input
                name="featured"
                type="checkbox"
                value="true"
                defaultChecked={initialValues.featured ?? false}
                className="w-4 h-4 rounded border-bone/30 bg-bone/5 accent-ochre"
              />
              <span className="text-sm text-bone/70">Featured on homepage</span>
            </label>
          </div>
        </div>
      </section>

      {/* Cover art */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Cover Art</h2>

        <div className="flex items-center gap-4">
          {coverPreview ? (
            <img
              src={coverPreview}
              alt=""
              className="w-20 h-20 rounded object-cover border border-bone/15 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded bg-bone/5 border border-bone/15 shrink-0" />
          )}
          <input
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            className="text-sm text-bone/50 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-bone/10 file:text-bone/70 file:text-xs hover:file:bg-bone/15 cursor-pointer"
          />
        </div>
      </section>

      {/* Description */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Description</h2>
        <textarea
          name="description"
          rows={3}
          defaultValue={initialValues.description ?? ""}
          className={INPUT}
        />
      </section>

      {/* Streaming links */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Streaming Links</h2>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["streaming_spotify", "Spotify"],
              ["streaming_apple_music", "Apple Music"],
              ["streaming_tidal", "Tidal"],
              ["streaming_youtube_music", "YouTube Music"],
            ] as const
          ).map(([name, label]) => (
            <div key={name}>
              <label className={LABEL}>{label}</label>
              <input
                name={name}
                type="url"
                defaultValue={streaming[name.replace("streaming_", "")] ?? ""}
                placeholder="https://..."
                className={INPUT}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Form actions */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-ochre text-ink text-sm font-medium px-5 py-2 rounded hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create Release"
              : "Save Changes"}
        </button>
        <Link
          href="/admin/releases"
          className="text-sm text-bone/40 hover:text-bone transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
