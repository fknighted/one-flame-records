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
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {/* Type pills */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by type">
        <button
          onClick={() => push("type", "")}
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
            !currentType
              ? "bg-oxblood text-bone"
              : "bg-oxblood/10 text-ink hover:bg-oxblood/20"
          }`}
        >
          All
        </button>
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => push("type", currentType === t ? "" : t)}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
              currentType === t
                ? "bg-oxblood text-bone"
                : "bg-oxblood/10 text-ink hover:bg-oxblood/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span className="hidden sm:block w-px h-4 bg-oxblood/15" aria-hidden="true" />

      {/* Artist dropdown */}
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

      {/* Sort chips */}
      <div className="sm:ml-auto flex gap-1.5" role="group" aria-label="Sort releases">
        {SORTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => push("sort", value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              currentSort === value
                ? "bg-ink text-bone"
                : "bg-transparent text-ink/50 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
