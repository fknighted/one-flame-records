"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const STATUSES = [
  { value: "",           label: "All" },
  { value: "rendering",  label: "Rendering" },
  { value: "done",       label: "Done" },
  { value: "failed",     label: "Failed" },
] as const;

export default function VideoLibraryFilter({ jobCount }: { jobCount: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("status") ?? "";

  const push = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set("status", value);
      } else {
        next.delete("status");
      }
      router.push(`/portal/videos?${next.toString()}`);
    },
    [params, router]
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/50 mr-1">
          Library
        </span>
        <div className="w-4 h-px bg-bone/10" />
        {STATUSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => push(value)}
            className={`px-3 py-1 text-[11px] font-semibold rounded transition-colors ${
              current === value
                ? "bg-ochre text-ink"
                : "bg-transparent text-bone/70 border border-bone/10 hover:border-bone/30 hover:text-bone"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="font-mono text-[11px] text-bone/40 tracking-[0.04em]">
        {jobCount} {jobCount === 1 ? "job" : "jobs"}
      </span>
    </div>
  );
}
