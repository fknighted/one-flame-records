"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function PublicError({
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
    <div className="px-6 py-20 max-w-xl mx-auto text-center space-y-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-oxblood">Error</p>
      <h2 className="font-display font-bold text-ink text-2xl">Something went wrong</h2>
      <p className="text-sm text-ink/60">We hit a snag loading this page. Please try again.</p>
      <button
        onClick={reset}
        className="rounded bg-oxblood px-5 py-2 text-sm font-medium text-cream hover:bg-oxblood/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
