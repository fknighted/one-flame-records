"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/admin/videos/actions";

type Artist = { id: string; stage_name: string };
type Release = { id: string; title: string };

type InitialValues = {
  id?: string;
  title?: string;
  youtube_id?: string;
  artist_id?: string;
  release_id?: string | null;
  kind?: string;
  featured?: boolean;
  published_at?: string;
};

const KIND_OPTIONS = [
  { value: "official", label: "Official Video" },
  { value: "lyric", label: "Lyric Video" },
  { value: "live", label: "Live Performance" },
  { value: "bts", label: "Behind the Scenes" },
  { value: "other", label: "Other" },
];

const INPUT =
  "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";
const SECTION_HEADING =
  "text-xs font-sans uppercase tracking-widest text-bone/35 pb-2 border-b border-bone/10";

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export default function VideoForm({
  action,
  initialValues = {},
  mode,
  artists,
  releases,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initialValues?: InitialValues;
  mode: "create" | "edit";
  artists: Artist[];
  releases: Release[];
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [youtubeInput, setYoutubeInput] = useState(
    initialValues.youtube_id ?? ""
  );
  const [previewId, setPreviewId] = useState<string | null>(
    initialValues.youtube_id ?? null
  );

  useEffect(() => {
    const id = extractYouTubeId(youtubeInput);
    setPreviewId(id);
  }, [youtubeInput]);

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

      {/* Video info */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Video</h2>

        <div>
          <label className={LABEL}>Title *</label>
          <input
            name="title"
            type="text"
            required
            defaultValue={initialValues.title ?? ""}
            className={INPUT}
          />
        </div>

        <div>
          <label className={LABEL}>YouTube URL or Video ID *</label>
          <input
            name="youtube_id"
            type="text"
            required
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://youtu.be/… or 11-char ID"
            className={INPUT}
          />
        </div>

        {/* YouTube thumbnail preview */}
        {previewId && (
          <div className="rounded overflow-hidden border border-bone/15 w-64">
            <img
              src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
              alt="YouTube thumbnail preview"
              className="w-full"
            />
          </div>
        )}
      </section>

      {/* Metadata */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Metadata</h2>

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
            <label className={LABEL}>Kind</label>
            <select
              name="kind"
              defaultValue={initialValues.kind ?? "official"}
              className={INPUT + " bg-ink"}
            >
              {KIND_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Related Release (optional)</label>
            <select
              name="release_id"
              defaultValue={initialValues.release_id ?? ""}
              className={INPUT + " bg-ink"}
            >
              <option value="">None</option>
              {releases.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Published Date</label>
            <input
              name="published_at"
              type="date"
              defaultValue={
                initialValues.published_at?.slice(0, 10) ??
                new Date().toISOString().slice(0, 10)
              }
              className={INPUT + " bg-ink"}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="hidden" name="featured" value="false" />
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
              ? "Add Video"
              : "Save Changes"}
        </button>
        <Link
          href="/admin/videos"
          className="text-sm text-bone/40 hover:text-bone transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
