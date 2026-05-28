"use client";

import { useTransition } from "react";
import { retryJob } from "@/app/admin/jobs/actions";

export function RetryButton({ jobId, errorText }: { jobId: string; errorText: string | null }) {
  const [pending, startTransition] = useTransition();

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
        onClick={() => startTransition(() => retryJob(jobId))}
        disabled={pending}
        className="text-xs text-ochre hover:text-ochre/80 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {pending ? "Retrying…" : "↺ Retry"}
      </button>
    </span>
  );
}
