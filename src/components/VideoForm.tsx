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

const INPUT = "studio-field";
const LABEL = "studio-field-label";
const SECTION_HEADING = "studio-section-title pb-2 border-b border-line";

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
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      {/* Video info */}
      <section className="space-y-4">
        <h2 className={SECTION_HEADING}>Video</h2>

        <div>
          <label htmlFor="title" className={LABEL}>Title *</label>
          <input
            id="title" name="title"
            type="text"
            required
            defaultValue={initialValues.title ?? ""}
            className={INPUT}
          />
        </div>

        {/* Source toggle */}
        <div>
          <p className={LABEL}>Video source *</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSource("youtube")}
              className={`studio-focus inline-flex items-center justify-center min-h-[44px] px-4 text-sm font-semibold ${
                source === "youtube"
                  ? "bg-raised text-paper border border-muted"
                  : "text-muted border border-line hover:text-paper"
              }`}
            >
              YouTube link
            </button>
            <button
              type="button"
              onClick={() => setSource("upload")}
              className={`studio-focus inline-flex items-center justify-center min-h-[44px] px-4 text-sm font-semibold ${
                source === "upload"
                  ? "bg-raised text-paper border border-muted"
                  : "text-muted border border-line hover:text-paper"
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
                <div className="overflow-hidden border border-line w-64 max-w-full">
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
                className="studio-field cursor-pointer"
              />

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-1">
                  <div className="h-2 w-full bg-line overflow-hidden">
                    <div
                      className="h-full bg-paper transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="studio-hint">Uploading… {uploadProgress}%</p>
                </div>
              )}

              {uploadError && (
                <p role="alert" className="studio-error">{uploadError}</p>
              )}

              {uploadedUrl && !uploading && (
                <p className="studio-success">Video uploaded successfully</p>
              )}

              {initialValues.storage_url && !uploadedUrl && (
                <div className="space-y-2">
                  <video
                    src={initialValues.storage_url}
                    controls
                    preload="metadata"
                    className="w-full border border-line bg-black aspect-video"
                  />
                  <p className="studio-hint">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="artist_id" className={LABEL}>Artist *</label>
            <select
              id="artist_id" name="artist_id"
              required
              defaultValue={initialValues.artist_id ?? ""}
              className={INPUT}
            >
              <option value="" disabled>Select artist…</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.stage_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kind" className={LABEL}>Kind</label>
            <select
              id="kind" name="kind"
              defaultValue={initialValues.kind ?? "official"}
              className={INPUT}
            >
              {KIND_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="release_id" className={LABEL}>Related Release (optional)</label>
            <select
              id="release_id" name="release_id"
              defaultValue={initialValues.release_id ?? ""}
              className={INPUT}
            >
              <option value="">None</option>
              {releases.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="published_at" className={LABEL}>Published Date</label>
            <input
              id="published_at" name="published_at"
              type="date"
              defaultValue={
                initialValues.published_at?.slice(0, 10) ??
                new Date().toISOString().slice(0, 10)
              }
              className={INPUT}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
            <input type="hidden" name="featured" value="false" />
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
      </section>

      {/* Form actions */}
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Saving…" : uploading ? "Uploading…" : mode === "create" ? "Add Video" : "Save Changes"}
        </button>
        <Link href="/admin/videos" className="studio-btn studio-btn-quiet studio-btn-sm">
          Cancel
        </Link>
      </div>
    </form>
  );
}
