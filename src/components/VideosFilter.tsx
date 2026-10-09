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

// Square chips on black with a 2px edge; the selected chip is yellow with black text.
function chip(selected: boolean) {
  return `min-h-[44px] px-3 border-2 type-label transition-colors focus-on-black ${
    selected
      ? "bg-yellow border-yellow text-black"
      : "bg-black border-muted text-paper hover:border-yellow hover:text-yellow"
  }`;
}

// Fields always sit on paper; this one sits on the black page, so the ring is yellow.
const SELECT =
  "min-h-[44px] max-w-full border-2 border-paper bg-paper text-black type-body-sm px-3 focus:outline-3 focus:outline-offset-2 focus:outline-yellow";


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
    <div className="flex items-center gap-3 overflow-x-auto p-1 -m-1 sm:flex-wrap sm:overflow-visible">
      {artists.length > 0 && (
        <select
          value={currentArtist}
          onChange={(e) => push("artist", e.target.value)}
          className={`${SELECT} shrink-0`}
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

      <div className="flex shrink-0 gap-2 sm:flex-wrap" role="group" aria-label="Filter by kind">
        <button
          type="button"
          onClick={() => push("kind", "")}
          aria-pressed={!currentKind}
          className={chip(!currentKind)}
        >
          All
        </button>
        {KINDS.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            onClick={() => push("kind", currentKind === value ? "" : value)}
            aria-pressed={currentKind === value}
            className={chip(currentKind === value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
