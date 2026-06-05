"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCampaign, type ActionState } from "./actions";

const SOURCE_TYPES = [
  { value: "video",      label: "Video",      hint: "Paste a transcript or description of the video" },
  { value: "post",       label: "Blog Post",  hint: "Paste the full post or a summary" },
  { value: "newsletter", label: "Newsletter", hint: "Paste the newsletter body" },
  { value: "text",       label: "Free text",  hint: "Write or paste any source material" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok",    label: "TikTok" },
  { value: "facebook",  label: "Facebook" },
];

const INPUT  = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL  = "block text-xs text-bone/50 mb-1.5";

export default function CampaignForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createCampaign, null);

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      {state?.error && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-2 text-sm text-oxblood">{state.error}</p>
      )}

      {/* Title */}
      <div>
        <label className={LABEL}>Campaign title *</label>
        <input name="title" type="text" required className={INPUT} placeholder="e.g. Summer Riddim release push" />
      </div>

      {/* Source type */}
      <div>
        <label className={LABEL}>Source type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOURCE_TYPES.map(({ value, label }) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="source_type" value={value} defaultChecked={value === "text"} className="sr-only peer" />
              <span className="block text-center rounded px-3 py-2 text-sm border border-bone/15 text-bone/60 peer-checked:bg-ochre peer-checked:text-ink peer-checked:border-ochre peer-checked:font-medium hover:border-bone/30 transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Source content */}
      <div>
        <label className={LABEL}>Source content *</label>
        <textarea
          name="source_content"
          required
          rows={10}
          className={INPUT}
          placeholder="Paste your source material here — video transcript, blog post, newsletter copy, or any text you want to repurpose…"
        />
      </div>

      {/* Target platforms */}
      <div>
        <label className={LABEL}>Target platforms *</label>
        <div className="flex gap-3 flex-wrap">
          {PLATFORMS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="platforms"
                value={value}
                defaultChecked
                className="w-4 h-4 rounded border-bone/30 bg-bone/5 accent-ochre"
              />
              <span className="text-sm text-bone/70">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pieces per platform */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={LABEL}>Pieces per platform</label>
          <select name="pieces_per_platform" defaultValue="2" className={INPUT + " bg-ink"}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} piece{n > 1 ? "s" : ""} per platform</option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-bone/30">3 platforms × 2 = 6 total pieces</p>
        </div>

        <div>
          <label className={LABEL}>Video pieces</label>
          <div className="space-y-2 mt-1">
            {[
              { value: "script",    label: "Script only",       hint: "Fast, no AI video spend" },
              { value: "generated", label: "Generate video",    hint: "Uses kie.ai pipeline" },
            ].map(({ value, label, hint }) => (
              <label key={value} className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="video_mode" value={value} defaultChecked={value === "script"} className="mt-0.5 accent-ochre" />
                <span>
                  <span className="block text-sm text-bone/70">{label}</span>
                  <span className="block text-[11px] text-bone/30">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-ochre px-6 py-2.5 text-sm font-medium text-ink hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Creating…" : "Create Campaign"}
        </button>
        <Link href="/admin/campaigns" className="text-sm text-bone/40 hover:text-bone transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
