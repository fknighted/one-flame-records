"use client";

import { useActionState, useState } from "react";
import { toggleVideoPublic } from "./actions";

type Props = { jobId: string; isPublic: boolean };

// key remounts inner when isPublic changes, resetting useActionState and clearing stale errors
export default function ShareToggle(props: Props) {
  return <ShareToggleInner key={String(props.isPublic)} {...props} />;
}

function ShareToggleInner({ jobId, isPublic }: Props) {
  const [state, formAction, pending] = useActionState(toggleVideoPublic, null);
  const [optimistic, setOptimistic] = useState(isPublic);

  // While pending: show optimistic. After error: revert to server truth. Otherwise: show optimistic.
  const effective = pending ? optimistic : (state?.error ? isPublic : optimistic);

  return (
    <form
      action={formAction}
      onSubmit={() => setOptimistic(!isPublic)}
      className="flex flex-col gap-1"
    >
      <input type="hidden" name="job_id" value={jobId} />
      {state?.error && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          effective
            ? "border-forest/40 bg-forest/10 text-sage hover:bg-forest/20"
            : "border-bone/20 text-bone/50 hover:text-bone hover:border-bone/40"
        }`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${effective ? "bg-forest" : "bg-bone/20"}`} />
        {pending ? "Saving…" : effective ? "Public — visible on your profile" : "Private — only you can see this"}
      </button>
    </form>
  );
}
