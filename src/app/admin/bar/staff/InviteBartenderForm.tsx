"use client";

import { useActionState } from "react";
import { inviteBartender } from "./actions";

const INPUT = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/50 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1";

export default function InviteBartenderForm() {
  const [state, formAction, pending] = useActionState(inviteBartender, null);

  return (
    <form action={formAction} className="space-y-4">
      {state && "error" in state && (
        <div className="bg-oxblood/20 border border-oxblood/50 rounded px-4 py-3 text-sm text-bone">
          {state.error}
        </div>
      )}
      {state === null && !pending && (
        <div className="bg-forest/20 border border-forest/40 rounded px-4 py-3 text-sm text-bone">
          Invite sent — they&apos;ll receive an email to set their password.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Name *</label>
          <input name="name" type="text" required placeholder="Bartender name" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Email *</label>
          <input name="email" type="email" required placeholder="email@example.com" className={INPUT} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-ochre text-ink text-sm font-medium px-5 py-2 rounded hover:bg-ochre/90 disabled:opacity-50 transition-colors"
      >
        {pending ? "Sending invite…" : "Send Invite"}
      </button>
    </form>
  );
}
