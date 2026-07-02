"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin error]", error);
  }, [error]);

  return (
    <div className="px-8 py-12 max-w-xl space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose">Error</p>
      <h2 className="font-display font-bold text-bone text-2xl">Something went wrong</h2>
      <p className="text-sm text-bone/60 font-mono bg-bone/5 border border-bone/10 rounded px-4 py-3 break-all">
        {error.message || "Unknown error"}
      </p>
      {error.digest && (
        <p className="text-xs text-bone/50 font-mono">digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="rounded bg-ochre px-5 py-2 text-sm font-medium text-ink hover:bg-ochre/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
