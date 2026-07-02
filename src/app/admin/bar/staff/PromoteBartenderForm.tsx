"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import { assignBartenderFlag } from "./actions";

const INPUT = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/50 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";

export default function PromoteBartenderForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    assignBartenderFlag,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-oxblood/20 border border-oxblood/50 rounded px-4 py-3 text-sm text-bone">
          {state.error}
        </div>
      )}

      <div>
        <label className={LABEL}>Artist email address</label>
        <input
          name="email"
          type="email"
          required
          placeholder="artist@example.com"
          className={INPUT}
        />
        <p className="mt-1.5 text-xs text-bone/50">
          The artist keeps their portal access — bar access is added on top.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-ochre text-ink text-sm font-medium px-5 py-2 rounded hover:bg-ochre/90 disabled:opacity-50 transition-colors"
      >
        {pending ? "Granting…" : "Grant Bar Access"}
      </button>
    </form>
  );
}
