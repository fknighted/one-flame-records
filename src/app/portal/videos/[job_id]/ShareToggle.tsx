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
      className="flex flex-col items-start gap-2"
    >
      <input type="hidden" name="job_id" value={jobId} />
      {state?.error && (
        <p role="alert" className="studio-error">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-secondary h-auto py-3 text-left normal-case tracking-normal leading-snug"
      >
        {effective && <span className="studio-chip studio-chip-ok shrink-0">Public</span>}
        {pending ? "Saving…" : effective ? "Public — visible on your profile" : "Private — only you can see this"}
      </button>
    </form>
  );
}
