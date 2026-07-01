"use client";

import { useRef, useState, useTransition } from "react";
import { getBrandClipUploadUrl, saveBrandClipUrl, removeBrandClip } from "./actions";

type ClipKey = "brand_intro_clip_url" | "brand_outro_clip_url";

interface Props {
  label: string;
  settingKey: ClipKey;
  currentUrl: string | null;
}

export default function BrandClipUploader({ label, settingKey, currentUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const { signedUrl, publicUrl } = await getBrandClipUploadUrl(file.name, file.type);

      const res = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);

      const result = await saveBrandClipUrl(settingKey, publicUrl);
      if (result && "error" in result) throw new Error(result.error);

      setLocalUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    startTransition(async () => {
      setError(null);
      const result = await removeBrandClip(settingKey);
      if (result && "error" in result) {
        setError(result.error);
      } else {
        setLocalUrl(null);
      }
    });
  }

  return (
    <div className="rounded-lg border border-bone/10 p-5">
      <p className="text-sm font-medium text-bone mb-3">{label}</p>

      {localUrl ? (
        <div className="space-y-3">
          <video
            src={localUrl}
            className="w-full max-w-xs rounded border border-bone/10"
            controls
            preload="metadata"
          />
          <p className="text-xs text-bone/40 font-mono break-all">{localUrl}</p>
          <div className="flex gap-3">
            <label className="cursor-pointer text-xs text-ochre hover:text-ochre/70 transition-colors">
              Replace
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/mov,video/quicktime"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-40"
            >
              {isPending ? "Removing…" : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/mov,video/quicktime"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="flex items-center gap-3 rounded border border-dashed border-bone/20 px-4 py-4 hover:border-bone/40 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-bone/30 shrink-0">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span className="text-sm text-bone/50">
              {uploading ? "Uploading…" : "Upload video clip (.mp4 or .mov)"}
            </span>
          </div>
        </label>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
