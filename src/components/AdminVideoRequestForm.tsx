"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { AdminVideoRequestState } from "@/app/admin/artists/[id]/videos/new/actions";

const SECONDS_PER_CLIP = 10;
const MIN_CLIPS = 4;
const MAX_CLIPS = 20;
const COST_PER_CLIP_USD = 0.28; // 10s × $0.028/s, Kling v1 std

function estimateCost(durationSeconds: number | null): { clips: number; cost: string } | null {
  if (!durationSeconds) return null;
  const clips = Math.min(MAX_CLIPS, Math.max(MIN_CLIPS, Math.round(durationSeconds / SECONDS_PER_CLIP)));
  const cost = (clips * COST_PER_CLIP_USD).toFixed(2);
  return { clips, cost };
}

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

interface ReferenceImage {
  id: string;
  title: string;
  thumbUrl: string | null;
}

interface Props {
  assets: AssetOption[];
  defaultAssetId?: string;
  referenceImages: ReferenceImage[];
  action: (prev: AdminVideoRequestState, formData: FormData) => Promise<AdminVideoRequestState>;
}

export function AdminVideoRequestForm({ assets, defaultAssetId, referenceImages, action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const [selectedAssetId, setSelectedAssetId] = useState(defaultAssetId ?? "");

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const estimate = estimateCost(selectedAsset?.duration_seconds ?? null);

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
          onChange={(e) => setSelectedAssetId(e.target.value)}
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
        {estimate && (
          <p className="mt-2 text-xs text-bone/40">
            ~{estimate.clips} clips · estimated Kling cost <span className="text-bone/60">${estimate.cost}</span>
          </p>
        )}
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

      {/* Reference images */}
      {referenceImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-bone/70 mb-2">
            Reference images
            <span className="ml-2 text-bone/40 font-normal text-xs">optional — anchors visual style</span>
          </label>
          <div className="flex flex-col gap-2">
            {referenceImages.map((img) => (
              <label key={img.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="reference_image_ids"
                  value={img.id}
                  className="accent-ochre flex-shrink-0"
                />
                {img.thumbUrl ? (
                  <img
                    src={img.thumbUrl}
                    alt={img.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-bone/10 flex-shrink-0" />
                )}
                <span className="text-sm text-bone group-hover:text-ochre transition-colors truncate">
                  {img.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Creative brief */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Director&apos;s notes
          <span className="ml-2 text-bone/40 font-normal text-xs">optional</span>
        </label>
        <textarea
          name="creative_brief"
          rows={4}
          placeholder="Mood, story arc, locations, visual references, anything you want Claude to factor in…"
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm placeholder:text-bone/25 focus:outline-none focus:border-ochre resize-y"
        />
      </div>

      {/* Lyrics override */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Lyrics
          <span className="ml-2 text-bone/40 font-normal text-xs">auto-transcribed — paste here to override</span>
        </label>
        <textarea
          name="lyrics"
          rows={6}
          placeholder="Leave blank to auto-transcribe from the audio…"
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm placeholder:text-bone/25 focus:outline-none focus:border-ochre resize-y font-mono"
        />
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
