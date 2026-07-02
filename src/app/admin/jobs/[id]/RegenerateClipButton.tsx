"use client";

import { useTransition } from "react";
import { regenerateClip } from "./actions";

interface Props {
  jobId: string;
  clipIndex: number;
}

export function RegenerateClipButton({ jobId, clipIndex }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await regenerateClip(jobId, clipIndex);
        })
      }
      className="text-xs px-2.5 py-1 rounded border border-bone/15 text-bone/60 hover:text-ochre hover:border-ochre/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {pending ? "…" : "↺ Regenerate"}
    </button>
  );
}
