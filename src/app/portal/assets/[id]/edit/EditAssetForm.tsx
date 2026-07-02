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
        <label className="block text-xs font-semibold uppercase tracking-wider text-bone/60 mb-1.5">
          Kind
        </label>
        <select
          name="kind"
          defaultValue={asset.kind}
          className="w-full bg-bone/5 border border-bone/20 rounded px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre/50"
        >
          {KIND_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-bone/60 mb-1.5">
          Title
        </label>
        <input
          name="title"
          defaultValue={asset.title}
          required
          className="w-full bg-bone/5 border border-bone/20 rounded px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre/50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-bone/60 mb-1.5">
          Notes{" "}
          <span className="text-bone/60 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          name="notes"
          defaultValue={asset.notes ?? ""}
          rows={3}
          className="w-full bg-bone/5 border border-bone/20 rounded px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre/50 resize-none"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/portal/assets"
          className="flex-1 text-center border border-bone/20 text-bone/60 py-2.5 rounded text-sm hover:text-bone transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-ochre text-ink font-semibold py-2.5 rounded text-sm hover:bg-ochre/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
