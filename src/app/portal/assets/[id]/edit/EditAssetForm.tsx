"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateAsset } from "../../actions";

const KIND_OPTIONS = [
  { value: "instrumental",      label: "Instrumental" },
  { value: "demo",              label: "Demo" },
  { value: "reference_video",   label: "Reference Video" },
  { value: "reference_image",   label: "Reference Image" },
];

export default function EditAssetForm({
  asset,
}: {
  asset: { id: string; title: string; kind: string; notes: string | null };
}) {
  const boundAction = updateAsset.bind(null, asset.id);
  const [state, action, pending] = useActionState(boundAction, null);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="studio-field-label">
          Kind
        </label>
        <select
          name="kind"
          defaultValue={asset.kind}
          className="studio-field"
        >
          {KIND_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="studio-field-label">
          Title
        </label>
        <input
          name="title"
          defaultValue={asset.title}
          required
          className="studio-field"
        />
      </div>

      <div>
        <label className="studio-field-label">
          Notes{" "}
          <span className="text-muted font-normal">(optional)</span>
        </label>
        <textarea
          name="notes"
          defaultValue={asset.notes ?? ""}
          rows={3}
          className="studio-field resize-none"
        />
      </div>

      {state?.error && (
        <p role="alert" className="studio-error">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/portal/assets"
          className="studio-btn studio-btn-secondary flex-1"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary flex-1"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
