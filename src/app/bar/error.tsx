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
    <div className="px-4 sm:px-6 py-12 max-w-xl mx-auto space-y-4">
      <p className="studio-label">Error</p>
      <h2 className="studio-section-title">Something went wrong</h2>
      <p className="text-[15px] text-muted">Please try again. If this keeps happening, refresh the page. Your open tabs are saved.</p>
      {error.digest && <p className="studio-hint studio-figures">ref: {error.digest}</p>}
      <button
        onClick={reset}
        className="studio-btn studio-btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
