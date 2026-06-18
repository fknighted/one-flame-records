"use client";

import { useActionState } from "react";
import { toggleVideoPublic } from "./actions";

export default function ShareToggle({ jobId, isPublic }: { jobId: string; isPublic: boolean }) {
  const [state, formAction, pending] = useActionState(toggleVideoPublic, null);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <input type="hidden" name="job_id" value={jobId} />
      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          isPublic
            ? "border-forest/40 bg-forest/10 text-forest hover:bg-forest/20"
            : "border-bone/20 text-bone/50 hover:text-bone hover:border-bone/40"
        }`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${isPublic ? "bg-forest" : "bg-bone/20"}`} />
        {pending ? "Saving…" : isPublic ? "Public — visible on your profile" : "Private — only you can see this"}
      </button>
    </form>
  );
}
