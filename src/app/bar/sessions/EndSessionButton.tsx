"use client";

import { useActionState } from "react";
import { endSession } from "./actions";

export default function EndSessionButton({ sessionId }: { sessionId: string }) {
  const [state, formAction, pending] = useActionState(endSession, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="session_id" value={sessionId} />
      {state?.error && <p className="text-xs text-red-400 mb-1">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="border border-bone/20 text-bone/60 hover:text-bone hover:border-bone/40 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
      >
        {pending ? "Ending…" : "End"}
      </button>
    </form>
  );
}
