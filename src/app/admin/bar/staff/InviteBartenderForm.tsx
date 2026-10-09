"use client";

import { useActionState } from "react";
import { inviteBartender } from "./actions";

const INPUT = "studio-field";
const LABEL = "studio-field-label";

export default function InviteBartenderForm() {
  const [state, formAction, pending] = useActionState(inviteBartender, null);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <div role="alert" className="studio-error">
          {state.error}
        </div>
      )}
      {state === null && !pending && (
        <div className="studio-success">
          Invite sent — they&apos;ll receive an email to set their password.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bartender-name" className={LABEL}>Name *</label>
          <input id="bartender-name" name="name" type="text" required placeholder="Bartender name" className={INPUT} />
        </div>
        <div>
          <label htmlFor="bartender-email" className={LABEL}>Email *</label>
          <input id="bartender-email" name="email" type="email" required placeholder="email@example.com" className={INPUT} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-primary"
      >
        {pending ? "Sending invite…" : "Send Invite"}
      </button>
    </form>
  );
}
