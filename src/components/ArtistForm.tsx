"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/admin/artists/actions";

type InitialValues = {
  id?: string;
  stage_name?: string;
  slug?: string;
  legal_name?: string | null;
  bio?: string;
  hometown?: string | null;
  genres?: string[];
  status?: string;
  featured_order?: number | null;
  photo_url?: string | null;
  socials?: Record<string, string>;
  streaming?: Record<string, string>;
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

export default function ArtistForm({
  action,
  initialValues = {},
  mode,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: InitialValues;
  mode: "create" | "edit";
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [stageName, setStageName] = useState(initialValues.stage_name ?? "");
  const [slug, setSlug] = useState(initialValues.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!initialValues.slug);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialValues.photo_url ?? null
  );

  const socials = initialValues.socials ?? {};
  const streaming = initialValues.streaming ?? {};
  const genresStr = (initialValues.genres ?? []).join(", ");

  function handleStageNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setStageName(val);
    if (!slugEdited) setSlug(slugify(val));
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugEdited(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
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
            <label className={LABEL}>Stage Name *</label>
            <input
              name="stage_name"
              type="text"
              required
              value={stageName}
              onChange={handleStageNameChange}
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
            <label className={LABEL}>Legal Name</label>
            <input
              name="legal_name"
              type="text"
              defaultValue={initialValues.legal_name ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Status</label>
            <select
              name="status"
              defaultValue={initialValues.status ?? "active"}
              className={INPUT + " bg-ink"}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Hometown</label>
            <input
              name="hometown"
              type="text"
              defaultValue={initialValues.hometown ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Featured Order</label>
            <input
              name="featured_order"
              type="number"
              min="1"
              defaultValue={initialValues.featured_order ?? ""}
              placeholder="Leave blank to omit"
              className={INPUT}
            />
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Profile</h2>

        <div>
          <label className={LABEL}>Bio</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={initialValues.bio ?? ""}
            className={INPUT}
          />
        </div>

        <div>
          <label className={LABEL}>Genres (comma-separated)</label>
          <input
            name="genres"
            type="text"
            defaultValue={genresStr}
            placeholder="Reggae, Dancehall, Roots"
            className={INPUT}
          />
        </div>

        <div>
          <label className={LABEL}>Photo</label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt=""
                className="w-16 h-16 rounded-full object-cover border border-bone/15 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-bone/5 border border-bone/15 shrink-0" />
            )}
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="text-sm text-bone/50 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-bone/10 file:text-bone/70 file:text-xs hover:file:bg-bone/15 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Social links */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Social Links</h2>
        <div className="grid grid-cols-2 gap-4">
          {(
            [
              ["socials_instagram", "Instagram"],
              ["socials_twitter", "Twitter / X"],
              ["socials_facebook", "Facebook"],
              ["socials_youtube", "YouTube"],
            ] as const
          ).map(([name, label]) => (
            <div key={name}>
              <label className={LABEL}>{label}</label>
              <input
                name={name}
                type="url"
                defaultValue={socials[name.replace("socials_", "")] ?? ""}
                placeholder="https://..."
                className={INPUT}
              />
            </div>
          ))}
        </div>
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
              ? "Create Artist"
              : "Save Changes"}
        </button>
        <Link
          href="/admin/artists"
          className="text-sm text-bone/40 hover:text-bone transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
