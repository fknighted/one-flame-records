"use client";

import { useTransition } from "react";
import { retryJob, resetJob } from "@/app/admin/jobs/actions";

const ACTIVE_STATUSES = ["pending", "analyzing", "prompting", "generating", "assembling"];

export function JobActions({ jobId, status, errorText }: { jobId: string; status: string; errorText: string | null }) {
  const [retryPending, startRetry] = useTransition();
  const [resetPending, startReset] = useTransition();

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-2">
        {errorText && (
          <span
            className="text-oxblood/50 text-xs truncate max-w-[120px] inline-block align-middle"
            title={errorText}
          >
            {errorText.length > 30 ? errorText.slice(0, 30) + "…" : errorText}
          </span>
        )}
        <button
          onClick={() => startRetry(() => retryJob(jobId))}
          disabled={retryPending}
          className="text-xs text-ochre hover:text-ochre/80 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {retryPending ? "Retrying…" : "↺ Retry"}
        </button>
      </span>
    );
  }

  if (ACTIVE_STATUSES.includes(status)) {
    return (
      <button
        onClick={() => startReset(() => resetJob(jobId))}
        disabled={resetPending}
        className="text-xs text-bone/30 hover:text-oxblood transition-colors disabled:opacity-50 whitespace-nowrap"
        title="Mark as failed so it can be retried"
      >
        {resetPending ? "Resetting…" : "↩ Reset"}
      </button>
    );
  }

  return null;
}

// Keep old export name working
export function RetryButton({ jobId, errorText }: { jobId: string; errorText: string | null }) {
  return <JobActions jobId={jobId} status="failed" errorText={errorText} />;
}
