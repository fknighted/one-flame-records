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
        className="studio-btn studio-btn-secondary studio-btn-sm"
      >
        {pending ? "Sending…" : "Resend invite"}
      </button>
      {state?.error && (
        <p role="alert" className="studio-error text-[13px]">{state.error}</p>
      )}
    </form>
  );
}
