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

const INPUT = "studio-field";
const LABEL = "studio-field-label";
const SECTION_HEADING = "studio-section-title pb-2 border-b border-line";

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
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Basic Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className={LABEL}>Title *</label>
            <input
              id="title" name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="slug" className={LABEL}>URL Slug *</label>
            <input
              id="slug" name="slug"
              type="text"
              required
              value={slug}
              onChange={handleSlugChange}
              className={INPUT}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="artist_id" className={LABEL}>Artist *</label>
            <select
              id="artist_id" name="artist_id"
              required
              defaultValue={initialValues.artist_id ?? ""}
              className={INPUT}
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
            <label htmlFor="type" className={LABEL}>Type *</label>
            <select
              id="type" name="type"
              defaultValue={initialValues.type ?? "single"}
              className={INPUT}
            >
              <option value="single">Single</option>
              <option value="ep">EP</option>
              <option value="album">Album</option>
              <option value="mixtape">Mixtape</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="release_date" className={LABEL}>Release Date *</label>
            <input
              id="release_date" name="release_date"
              type="date"
              required
              defaultValue={initialValues.release_date ?? ""}
              className={INPUT}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
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
                className="studio-check"
              />
              <span className="text-[15px]">Featured on homepage</span>
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
              className="w-20 h-20 object-cover border border-line shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-raised border border-line shrink-0" />
          )}
          <div className="space-y-1.5 min-w-0 flex-1">
            <input
              id="cover"
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              className="studio-field cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Description</h2>
        <label htmlFor="description" className="sr-only">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialValues.description ?? ""}
          className={INPUT}
        />
      </section>

      {/* Streaming links */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Streaming Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["streaming_spotify", "Spotify"],
              ["streaming_apple_music", "Apple Music"],
              ["streaming_tidal", "Tidal"],
              ["streaming_youtube_music", "YouTube Music"],
            ] as const
          ).map(([name, label]) => (
            <div key={name}>
              <label htmlFor={name} className={LABEL}>{label}</label>
              <input
                id={name} name={name}
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
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Create Release"
              : "Save Changes"}
        </button>
        <Link
          href="/admin/releases"
          className="studio-btn studio-btn-quiet studio-btn-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
