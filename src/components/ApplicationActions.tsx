"use client";

import { useActionState } from "react";
import {
  approveApplication,
  rejectApplication,
  type ActionState,
} from "@/app/admin/applications/actions";

export default function ApplicationActions({ id }: { id: string }) {
  const [approveState, approveAction, approvePending] = useActionState<
    ActionState,
    FormData
  >(approveApplication, null);
  const [rejectState, rejectAction, rejectPending] = useActionState<
    ActionState,
    FormData
  >(rejectApplication, null);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form action={approveAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        {approveState?.error && (
          <p className="text-sm text-red-400">{approveState.error}</p>
        )}
        <button
          type="submit"
          disabled={approvePending || rejectPending}
          className="px-6 py-2 rounded bg-forest text-bone text-sm font-medium hover:bg-forest/80 disabled:opacity-50 transition-colors"
        >
          {approvePending ? "Approving…" : "Approve"}
        </button>
      </form>

      <form action={rejectAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        {rejectState?.error && (
          <p className="text-sm text-red-400">{rejectState.error}</p>
        )}
        <button
          type="submit"
          disabled={approvePending || rejectPending}
          className="px-6 py-2 rounded border border-bone/20 text-bone/70 text-sm font-medium hover:border-bone/40 hover:text-bone disabled:opacity-50 transition-colors"
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </button>
      </form>
    </div>
  );
}
