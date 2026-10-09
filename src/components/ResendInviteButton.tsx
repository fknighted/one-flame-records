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
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-secondary"
        >
          {pending ? "Sending…" : "Send Invite Email"}
        </button>
        {state && "success" in state && (
          <p className="studio-success">Invite sent to {email}.</p>
        )}
        {state && "error" in state && (
          <p role="alert" className="studio-error">{state.error}</p>
        )}
      </div>

      {/* Fallback: shown when Resend isn't available yet */}
      {state && "link" in state && (
        <div className="studio-card space-y-3">
          <p className="studio-label">
            Email unavailable — copy and send this link manually
          </p>
          <p className="text-[15px] text-paper break-all studio-figures leading-relaxed">
            {state.link}
          </p>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText((state as { link: string }).link)
            }
            className="studio-btn studio-btn-secondary studio-btn-sm"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </form>
  );
}
