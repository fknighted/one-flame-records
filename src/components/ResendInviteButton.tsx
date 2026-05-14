"use client";

import { useActionState } from "react";
import { resendInvite, type ActionState } from "@/app/admin/applications/actions";

export default function ResendInviteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resendInvite,
    null
  );

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-bone/20 px-4 py-2 text-sm text-bone/70 hover:border-bone/40 hover:text-bone transition-colors disabled:opacity-50"
        >
          {pending ? "Sending…" : "Resend Invite Email"}
        </button>
        {state && "error" in state && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-forest">Invite sent.</p>
        )}
      </div>
    </form>
  );
}
