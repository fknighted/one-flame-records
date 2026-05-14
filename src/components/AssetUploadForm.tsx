"use client";

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
    uploadAsset,
    null
  );
  const [selectedKind, setSelectedKind] = useState(KINDS[0].value);

  const currentKind = KINDS.find((k) => k.value === selectedKind) ?? KINDS[0];

  return (
    <form action={action} className="space-y-5">
      {state && "error" in state && (
        <div className="rounded border border-oxblood/30 bg-oxblood/20 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-bone/50">
          Kind
        </label>
        <select
          name="kind"
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value)}
          className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone focus:border-ochre focus:outline-none"
        >
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-bone/50">
          Title
        </label>
        <input
          name="title"
          type="text"
          required
          placeholder="Track or file name"
          className="w-full rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:border-ochre focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-bone/50">
          Notes{" "}
          <span className="normal-case text-bone/30">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="BPM, key, or any notes for the label…"
          className="w-full resize-none rounded border border-bone/20 bg-ink px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:border-ochre focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-bone/50">
          File
        </label>
        <input
          name="file"
          type="file"
          required
          accept={currentKind.accept}
          className="w-full cursor-pointer text-sm text-bone/70 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-bone/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-bone hover:file:bg-bone/20"
        />
        <p className="mt-1.5 text-xs text-bone/30">Max 10 MB</p>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-ochre px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ochre/90 disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Upload Asset"}
        </button>
        <a
          href="/portal/assets"
          className="text-sm text-bone/50 transition-colors hover:text-bone"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
