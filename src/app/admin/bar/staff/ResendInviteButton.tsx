"use client";

import { useActionState } from "react";
import { resendBartenderInvite, type ActionState } from "./actions";

export default function ResendInviteButton({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resendBartenderInvite,
    null
  );

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-ochre/70 hover:text-ochre transition-colors disabled:opacity-50"
      >
        {pending ? "Sending…" : "Resend invite"}
      </button>
      {state?.error && (
        <p className="text-[10px] text-oxblood">{state.error}</p>
      )}
    </form>
  );
}
