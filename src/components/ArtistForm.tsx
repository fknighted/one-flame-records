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

const INPUT = "studio-field";
const LABEL = "studio-field-label";
const SECTION_HEADING = "studio-section-title pb-2 border-b border-line";

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
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Basic Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stage_name" className={LABEL}>Stage Name *</label>
            <input
              id="stage_name" name="stage_name"
              type="text"
              required
              value={stageName}
              onChange={handleStageNameChange}
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
            <label htmlFor="legal_name" className={LABEL}>Legal Name</label>
            <input
              id="legal_name" name="legal_name"
              type="text"
              defaultValue={initialValues.legal_name ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="status" className={LABEL}>Status</label>
            <select
              id="status" name="status"
              defaultValue={initialValues.status ?? "active"}
              className={INPUT}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hometown" className={LABEL}>Hometown</label>
            <input
              id="hometown" name="hometown"
              type="text"
              defaultValue={initialValues.hometown ?? ""}
              className={INPUT}
            />
          </div>
          <div>
            <label htmlFor="featured_order" className={LABEL}>Featured Order</label>
            <input
              id="featured_order" name="featured_order"
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
          <label htmlFor="bio" className={LABEL}>Bio</label>
          <textarea
            id="bio" name="bio"
            rows={4}
            defaultValue={initialValues.bio ?? ""}
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="genres" className={LABEL}>Genres (comma-separated)</label>
          <input
            id="genres" name="genres"
            type="text"
            defaultValue={genresStr}
            placeholder="Reggae, Dancehall, Roots"
            className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="photo" className={LABEL}>Photo</label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt=""
                className="w-16 h-16 object-cover border border-line shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-raised border border-line shrink-0" />
            )}
            <div className="space-y-1.5 min-w-0 flex-1">
              <input
                id="photo" name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="studio-field cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social links */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Social Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["socials_instagram", "Instagram"],
              ["socials_twitter", "Twitter / X"],
              ["socials_facebook", "Facebook"],
              ["socials_youtube", "YouTube"],
            ] as const
          ).map(([name, label]) => (
            <div key={name}>
              <label htmlFor={name} className={LABEL}>{label}</label>
              <input
                id={name} name={name}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ["streaming_spotify", "Spotify"],
              ["streaming_apple_music", "Apple Music"],
              ["streaming_tidal", "Tidal"],
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
              ? "Create Artist"
              : "Save Changes"}
        </button>
        <Link
          href="/admin/artists"
          className="studio-btn studio-btn-quiet studio-btn-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
