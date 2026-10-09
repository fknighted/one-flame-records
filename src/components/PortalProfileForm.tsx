"use client";

import { useActionState, useState, useEffect } from "react";
import { updateProfile, type ProfileActionState } from "@/app/portal/profile/actions";

type InitialValues = {
  bio: string;
  photo_url: string | null;
  socials: Record<string, string>;
  streaming: Record<string, string>;
  stage_name: string;
  hometown: string | null;
  genres: string[];
};

const INPUT = "studio-field";
const LABEL = "studio-field-label";
const READONLY = "studio-field bg-transparent text-paper border-muted cursor-default";
const SECTION_HEADING = "studio-section-title pb-2 border-b border-line";

export default function PortalProfileForm({
  initialValues,
}: {
  initialValues: InitialValues;
}) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    null
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialValues.photo_url
  );
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (state && "success" in state) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSaved(true);
      const t = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  const socials = initialValues.socials;
  const streaming = initialValues.streaming;

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      {state && "error" in state && (
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      {/* Read-only identity fields */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Identity</h2>
        <p className="studio-hint">
          To change your stage name, hometown, or genres — contact the label.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Stage Name</label>
            <input
              type="text"
              readOnly
              value={initialValues.stage_name}
              className={READONLY}
            />
          </div>
          <div>
            <label className={LABEL}>Hometown</label>
            <input
              type="text"
              readOnly
              value={initialValues.hometown ?? "—"}
              className={READONLY}
            />
          </div>
        </div>
        <div>
          <label className={LABEL}>Genres</label>
          <input
            type="text"
            readOnly
            value={initialValues.genres.join(", ") || "—"}
            className={READONLY}
          />
        </div>
      </section>

      {/* Bio */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Bio</h2>
        <div>
          <label className={LABEL}>Bio</label>
          <textarea
            name="bio"
            rows={5}
            defaultValue={initialValues.bio}
            placeholder="Tell your story…"
            className={INPUT}
          />
        </div>
      </section>

      {/* Photo */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Photo</h2>
        <div className="flex items-center gap-4">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt=""
              className="w-16 h-16 object-cover border border-line shrink-0"
            />
          ) : (
            <div className="w-16 h-16 bg-panel border border-line shrink-0" />
          )}
          <input
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="studio-field cursor-pointer min-w-0 flex-1"
          />
        </div>
      </section>

      {/* Socials */}
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
              <label className={LABEL}>{label}</label>
              <input
                name={name}
                type="url"
                defaultValue={socials[name.replace("socials_", "")] ?? ""}
                placeholder="https://…"
                className={INPUT}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Streaming */}
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
              <label className={LABEL}>{label}</label>
              <input
                name={name}
                type="url"
                defaultValue={streaming[name.replace("streaming_", "")] ?? ""}
                placeholder="https://…"
                className={INPUT}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
        {showSaved && (
          <span className="studio-success">Saved.</span>
        )}
      </div>
    </form>
  );
}
