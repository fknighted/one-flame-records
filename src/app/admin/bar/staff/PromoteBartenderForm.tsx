"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import { assignBartenderFlag } from "./actions";

const INPUT = "studio-field";
const LABEL = "studio-field-label";

export default function PromoteBartenderForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    assignBartenderFlag,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="promote-email" className={LABEL}>Artist email address</label>
        <input
          id="promote-email"
          name="email"
          type="email"
          required
          placeholder="artist@example.com"
          className={INPUT}
        />
        <p className="studio-hint mt-1.5">
          The artist keeps their portal access — bar access is added on top.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-secondary"
      >
        {pending ? "Granting…" : "Grant Bar Access"}
      </button>
    </form>
  );
}
