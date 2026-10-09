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
      <p className="studio-label">Error</p>
      <h2 className="studio-section-title">Something went wrong</h2>
      <p className="studio-error break-all">
        {error.message || "Unknown error"}
      </p>
      {error.digest && (
        <p className="studio-hint studio-figures">digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="studio-btn studio-btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
