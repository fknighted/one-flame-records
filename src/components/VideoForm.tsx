"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { ActionState } from "@/app/admin/videos/actions";
import { getVideoUploadUrl } from "@/app/admin/videos/actions";

type Artist = { id: string; stage_name: string };
type Release = { id: string; title: string };

type InitialValues = {
  id?: string;
  title?: string;
  youtube_id?: string | null;
  storage_url?: string | null;
  artist_id?: string;
  release_id?: string | null;
  kind?: string;
  featured?: boolean;
  published_at?: string;
};

const KIND_OPTIONS = [
  { value: "music_video", label: "Official Video" },
  { value: "lyric", label: "Lyric Video" },
  { value: "live", label: "Live Performance" },
  { value: "behind_scenes", label: "Behind the Scenes" },
  { value: "generated", label: "Generated Video" },
];

const INPUT =
  "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/50 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";
const SECTION_HEADING =
  "text-xs font-sans uppercase tracking-widest text-bone/52 pb-2 border-b border-bone/10";

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

  const hasUpload = !!initialValues.storage_url && !initialValues.youtube_id;
  const [source, setSource] = useState<"youtube" | "upload">(hasUpload ? "upload" : "youtube");

  const [youtubeInput, setYoutubeInput] = useState(initialValues.youtube_id ?? "");
  const previewId = extractYouTubeId(youtubeInput);

  // Upload state
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialValues.storage_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadedUrl("");

    try {
      const { signedUrl, publicUrl } = await getVideoUploadUrl(file.name, file.type);

      // Upload directly to Supabase Storage — no file passes through the server
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setUploadedUrl(publicUrl);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
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

        {/* Source toggle */}
        <div>
          <label className={LABEL}>Video source *</label>
          <div className="flex rounded overflow-hidden border border-bone/15 w-fit mb-4">
            <button
              type="button"
              onClick={() => setSource("youtube")}
              className={`px-4 py-1.5 text-sm transition-colors ${
                source === "youtube"
                  ? "bg-ochre text-ink font-medium"
                  : "text-bone/50 hover:text-bone"
              }`}
            >
              YouTube link
            </button>
            <button
              type="button"
              onClick={() => setSource("upload")}
              className={`px-4 py-1.5 text-sm transition-colors ${
                source === "upload"
                  ? "bg-ochre text-ink font-medium"
                  : "text-bone/50 hover:text-bone"
              }`}
            >
              Upload file
            </button>
          </div>

          {source === "youtube" && (
            <div className="space-y-3">
              <input
                name="youtube_id"
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="https://youtu.be/… or 11-char ID"
                className={INPUT}
              />
              {previewId && (
                <div className="rounded overflow-hidden border border-bone/15 w-64">
                  <img
                    src={`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`}
                    alt="YouTube thumbnail preview"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}

          {source === "upload" && (
            <div className="space-y-3">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="block w-full text-sm text-bone/60 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-bone/10 file:text-bone file:text-sm hover:file:bg-bone/20 file:cursor-pointer disabled:opacity-50"
              />

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-bone/10 overflow-hidden">
                    <div
                      className="h-full bg-ochre transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-bone/60">Uploading… {uploadProgress}%</p>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-rose">{uploadError}</p>
              )}

              {uploadedUrl && !uploading && (
                <p className="text-xs text-sage">✓ Video uploaded successfully</p>
              )}

              {initialValues.storage_url && !uploadedUrl && (
                <div className="space-y-2">
                  <video
                    src={initialValues.storage_url}
                    controls
                    preload="metadata"
                    className="w-full rounded border border-bone/10 bg-ink aspect-video"
                  />
                  <p className="text-xs text-bone/60">
                    Upload a new file to replace this video.
                  </p>
                </div>
              )}

              {/* Hidden field — the presigned upload stores the URL here */}
              <input type="hidden" name="storage_url" value={uploadedUrl || initialValues.storage_url || ""} />
            </div>
          )}
        </div>
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
              <option value="" disabled>Select artist…</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.stage_name}</option>
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
                <option key={value} value={value}>{label}</option>
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
                <option key={r.id} value={r.id}>{r.title}</option>
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
          disabled={pending || uploading}
          className="bg-ochre text-ink text-sm font-medium px-5 py-2 rounded hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Saving…" : uploading ? "Uploading…" : mode === "create" ? "Add Video" : "Save Changes"}
        </button>
        <Link href="/admin/videos" className="text-sm text-bone/60 hover:text-bone transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
