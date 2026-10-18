"use client";
import { useUploadAction } from "@/lib/uploads/use-upload-action";

import { useActionState, useState } from "react";
import { uploadAsset, type AssetActionState } from "@/app/portal/assets/actions";

const KINDS = [
  {
    value: "instrumental",
    label: "Instrumental",
    accept: "audio/mpeg,audio/wav,.mp3,.wav",
  },
  {
    value: "demo",
    label: "Demo",
    accept: "audio/mpeg,audio/wav,.mp3,.wav",
  },
  {
    value: "reference_video",
    label: "Reference Video",
    accept: "video/mp4,video/quicktime,.mp4,.mov",
  },
  {
    value: "reference_image",
    label: "Reference Image",
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
  },
];

export default function AssetUploadForm() {
  const [state, action, pending] = useActionState<AssetActionState, FormData>(
    useUploadAction(uploadAsset, "asset"),
    null
  );
  const [selectedKind, setSelectedKind] = useState(KINDS[0].value);

  const currentKind = KINDS.find((k) => k.value === selectedKind) ?? KINDS[0];

  return (
    <form action={action} className="space-y-5">
      {state && "error" in state && (
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="asset-kind" className="studio-field-label">Kind
        </label>
        <select
          id="asset-kind"
          name="kind"
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value)}
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
        <label htmlFor="asset-title" className="studio-field-label">Title
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
        <label htmlFor="asset-notes" className="studio-field-label">Notes{" "}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          id="asset-notes"
          name="notes"
          rows={3}
          placeholder="BPM, key, or any notes for the label…"
          className="studio-field resize-none"
        />
      </div>

      <div>
        <label htmlFor="asset-file" className="studio-field-label">File
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

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Uploading…" : "Upload Asset"}
        </button>
        <a
          href="/portal/assets"
          className="studio-btn studio-btn-quiet studio-btn-sm"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
