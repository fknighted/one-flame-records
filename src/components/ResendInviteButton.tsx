"use client";

import { useActionState } from "react";
import { resendInvite, type ActionState } from "@/app/admin/applications/actions";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com";

export default function ResendInviteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resendInvite,
    null
  );

  const portalLink =
    state && "link" in state
      ? `${SITE_URL}/auth/portal-invite?to=${encodeURIComponent(state.link)}`
      : null;

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-bone/20 px-4 py-2 text-sm text-bone/70 hover:border-bone/40 hover:text-bone transition-colors disabled:opacity-50"
        >
          {pending ? "Generating…" : "Generate Portal Link"}
        </button>
        {state && "error" in state && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
      </div>

      {portalLink && (
        <div className="rounded border border-bone/10 bg-bone/5 p-4 space-y-3">
          <p className="text-xs text-bone/40 uppercase tracking-wider">
            Send this link to the artist — safe to share via iMessage or WhatsApp
          </p>
          <p className="text-xs text-bone/70 break-all font-mono leading-relaxed">
            {portalLink}
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(portalLink)}
            className="text-xs text-ochre hover:text-ochre/80 transition-colors"
          >
            Copy to clipboard
          </button>
        </div>
      )}
    </form>
  );
}
