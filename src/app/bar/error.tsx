"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function BarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="px-6 py-12 max-w-xl mx-auto space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose">Error</p>
      <h2 className="font-display font-bold text-bone text-2xl">Something went wrong</h2>
      <p className="text-sm text-bone/60">Please try again. If this keeps happening, refresh the page — your open tabs are saved.</p>
      {error.digest && <p className="text-xs text-bone/40 font-mono">ref: {error.digest}</p>}
      <button
        onClick={reset}
        className="rounded bg-ochre px-5 py-2 text-sm font-medium text-ink hover:bg-ochre/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
