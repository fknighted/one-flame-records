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
    <div className="flex flex-wrap items-center gap-2">
      <span className="studio-label mr-1">
        Format
      </span>
      {TYPES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => push("type", value)}
          aria-pressed={currentType === value}
          className={`studio-focus inline-flex min-h-[44px] items-center px-4 text-[14px] font-bold border transition-colors ${
            currentType === value
              ? "bg-raised text-paper border-muted"
              : "text-muted border-line hover:text-paper"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
