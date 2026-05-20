"use client";

import { useActionState } from "react";
import type { AdminVideoRequestState } from "@/app/admin/artists/[id]/videos/new/actions";

const STYLE_PRESETS = [
  "Vintage roots reggae performance",
  "Modern dancehall energy",
  "Acoustic roots session",
  "Cinematic Jamaican landscape",
  "Studio session documentary",
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 — Landscape (YouTube)" },
  { value: "9:16", label: "9:16 — Vertical (Reels / TikTok)" },
  { value: "1:1",  label: "1:1 — Square (Instagram)" },
];

interface AssetOption {
  id: string;
  title: string;
  duration_seconds: number | null;
}

interface Props {
  assets: AssetOption[];
  defaultAssetId?: string;
  action: (prev: AdminVideoRequestState, formData: FormData) => Promise<AdminVideoRequestState>;
}

export function AdminVideoRequestForm({ assets, defaultAssetId, action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state?.error && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-3 text-sm text-bone">
          {state.error}
        </p>
      )}

      {/* Asset selector */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Source audio
        </label>
        <select
          name="asset_id"
          required
          defaultValue={defaultAssetId ?? ""}
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre"
        >
          <option value="">Select an asset…</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
              {a.duration_seconds
                ? ` (${Math.floor(a.duration_seconds / 60)}:${String(a.duration_seconds % 60).padStart(2, "0")})`
                : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Style preset */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Visual style
        </label>
        <select
          name="style_preset"
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre"
        >
          {STYLE_PRESETS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Aspect ratio */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Format
        </label>
        <div className="flex flex-col gap-2">
          {ASPECT_RATIOS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="aspect_ratio"
                value={value}
                defaultChecked={value === "16:9"}
                className="accent-ochre"
              />
              <span className="text-sm text-bone">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <input type="hidden" name="model" value="" />

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ochre px-6 py-2.5 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting…" : "Generate video"}
      </button>
    </form>
  );
}
