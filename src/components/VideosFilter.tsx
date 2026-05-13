"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Artist = { id: string; stage_name: string };

const KINDS: { value: string; label: string }[] = [
  { value: "music_video",    label: "Music Video" },
  { value: "lyric",          label: "Lyric" },
  { value: "live",           label: "Live" },
  { value: "behind_scenes",  label: "Behind the Scenes" },
];

type Props = { artists: Artist[] };

export default function VideosFilter({ artists }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const currentArtist = params.get("artist") ?? "";
  const currentKind   = params.get("kind") ?? "";

  const push = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`/videos?${next.toString()}`);
    },
    [params, router]
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {artists.length > 0 && (
        <select
          value={currentArtist}
          onChange={(e) => push("artist", e.target.value)}
          className="rounded border border-oxblood/20 bg-cream text-sm text-ink px-3 py-1.5 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
          aria-label="Filter by artist"
        >
          <option value="">All artists</option>
          {artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.stage_name}
            </option>
          ))}
        </select>
      )}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by kind">
        <button
          onClick={() => push("kind", "")}
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            !currentKind
              ? "bg-oxblood text-bone"
              : "bg-oxblood/10 text-ink hover:bg-oxblood/20"
          }`}
        >
          All
        </button>
        {KINDS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => push("kind", currentKind === value ? "" : value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
              currentKind === value
                ? "bg-oxblood text-bone"
                : "bg-oxblood/10 text-ink hover:bg-oxblood/20"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
