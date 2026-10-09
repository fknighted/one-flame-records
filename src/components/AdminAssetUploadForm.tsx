"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { uploadAssetForArtist, type AssetActionState } from "@/app/admin/artists/[id]/assets/actions";

const KINDS = [
  { value: "instrumental",    label: "Instrumental",    accept: "audio/mpeg,audio/wav,.mp3,.wav" },
  { value: "demo",            label: "Demo",            accept: "audio/mpeg,audio/wav,.mp3,.wav" },
  { value: "reference_video", label: "Reference Video", accept: "video/mp4,video/quicktime,.mp4,.mov" },
  { value: "reference_image", label: "Reference Image", accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" },
];

export default function AdminAssetUploadForm({ artistId }: { artistId: string }) {
  const boundAction = uploadAssetForArtist.bind(null, artistId);
  const [state, action, pending] = useActionState<AssetActionState, FormData>(boundAction, null);
  const [selectedKind, setSelectedKind] = useState(KINDS[0].value);
  const [uploaded, setUploaded] = useState(false);
  const prevPending = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (prevPending.current && !pending && state === null) {
      setUploaded(true);
      formRef.current?.reset();
      setSelectedKind(KINDS[0].value);
    }
    prevPending.current = pending;
  }, [pending, state]);

  const currentKind = KINDS.find((k) => k.value === selectedKind) ?? KINDS[0];

  return (
    <form ref={formRef} action={action} className="space-y-5">
      {state && "error" in state && (
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}
      {uploaded && !pending && !(state && "error" in state) && (
        <div className="studio-success flex items-center justify-between">
          <span>Asset uploaded successfully.</span>
          <button type="button" onClick={() => setUploaded(false)} aria-label="Dismiss" className="studio-btn studio-btn-quiet studio-btn-sm ml-4">
            ×
          </button>
        </div>
      )}

      <div>
        <label htmlFor="asset-kind" className="studio-field-label">
          Kind
        </label>
        <select
          id="asset-kind"
          name="kind"
          value={selectedKind}
          onChange={(e) => { setSelectedKind(e.target.value); setUploaded(false); }}
          className="studio-field"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="asset-title" className="studio-field-label">
          Title
        </label>
        <input
          id="asset-title"
          name="title"
          type="text"
          required
          placeholder="Track or file name"
          className="studio-field"
        />
      </div>

      <div>
        <label htmlFor="asset-notes" className="studio-field-label">
          Notes <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="asset-notes"
          name="notes"
          rows={3}
          placeholder="BPM, key, or any notes for the pipeline…"
          className="studio-field resize-none"
        />
      </div>

      <div>
        <label htmlFor="asset-file" className="studio-field-label">
          File
        </label>
        <input
          id="asset-file"
          name="file"
          type="file"
          required
          accept={currentKind.accept}
          className="studio-field cursor-pointer"
        />
        <p className="studio-hint mt-1.5">Max 10 MB</p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Uploading…" : "Upload Asset"}
        </button>
      </div>
    </form>
  );
}
