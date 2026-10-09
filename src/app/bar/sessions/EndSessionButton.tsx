"use client";

import { useActionState } from "react";
import { endSession } from "./actions";

export default function EndSessionButton({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState(endSession, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="session_id" value={sessionId} />
      {state?.error && <p role="alert" className="studio-error text-[13px] mb-1">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-secondary studio-btn-sm"
      >
        {pending ? "Ending…" : "End"}
      </button>
    </form>
  );
}
