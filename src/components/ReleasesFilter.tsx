"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Artist = { id: string; stage_name: string };

const TYPES = ["single", "ep", "album", "mixtape"] as const;
const SORTS = [
  { value: "", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A–Z" },
] as const;

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


export default function ReleasesFilter({ artists }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const currentArtist = params.get("artist") ?? "";
  const currentType   = params.get("type") ?? "";
  const currentSort   = params.get("sort") ?? "";

  const push = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`/releases?${next.toString()}`);
    },
    [params, router]
  );

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 p-1 -m-1">
      {/* Type pills */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
        <button
          type="button"
          onClick={() => push("type", "")}
          aria-pressed={!currentType}
          className={chip(!currentType)}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            type="button"
            key={t}
            onClick={() => push("type", currentType === t ? "" : t)}
            aria-pressed={currentType === t}
            className={chip(currentType === t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span className="hidden sm:block w-px h-6 bg-line" aria-hidden="true" />

      {/* Artist dropdown */}
      {artists.length > 0 && (
        <select
          value={currentArtist}
          onChange={(e) => push("artist", e.target.value)}
          className={SELECT}
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

      {/* Sort chips */}
      <div className="sm:ml-auto flex flex-wrap gap-2" role="group" aria-label="Sort releases">
        {SORTS.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            onClick={() => push("sort", value)}
            aria-pressed={currentSort === value}
            className={chip(currentSort === value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
