"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const TYPES = [
  { value: "",        label: "All" },
  { value: "single",  label: "Single" },
  { value: "ep",      label: "EP" },
  { value: "album",   label: "Album" },
  { value: "mixtape", label: "Mixtape" },
] as const;

type Props = { basePath: string };

export default function ReleasesManagerFilter({ basePath }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const currentType = params.get("type") ?? "";

  const push = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      router.push(`${basePath}?${next.toString()}`);
    },
    [params, router, basePath]
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/50 mr-1">
        Format
      </span>
      {TYPES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => push("type", value)}
          className={`px-3 py-1 text-[11px] font-semibold rounded transition-colors ${
            currentType === value
              ? "bg-ochre text-ink"
              : "bg-transparent text-bone/70 border border-bone/10 hover:border-bone/30 hover:text-bone"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
