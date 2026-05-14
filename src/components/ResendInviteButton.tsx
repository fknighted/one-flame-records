"use client";

import { useActionState } from "react";
import { resendInvite, type ActionState } from "@/app/admin/applications/actions";

export default function ResendInviteButton({
  id,
  email,
}: {
  id: string;
  email: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resendInvite,
    null
  );

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-bone/20 px-4 py-2 text-sm text-bone/70 hover:border-bone/40 hover:text-bone transition-colors disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send Invite Email"}
        </button>
        {state && "success" in state && (
          <p className="text-sm text-forest">Invite sent to {email}.</p>
        )}
        {state && "error" in state && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
      </div>

      {/* Fallback: shown when Resend isn't available yet */}
      {state && "link" in state && (
        <div className="rounded border border-bone/10 bg-bone/5 p-4 space-y-3">
          <p className="text-xs text-bone/40 uppercase tracking-wider">
            Email unavailable — copy and send this link manually
          </p>
          <p className="text-xs text-bone/70 break-all font-mono leading-relaxed">
            {state.link}
          </p>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText((state as { link: string }).link)
            }
            className="text-xs text-ochre hover:text-ochre/80 transition-colors"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </form>
  );
}
