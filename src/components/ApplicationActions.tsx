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
        {approveState && "error" in approveState && (
          <p role="alert" className="studio-error">{approveState.error}</p>
        )}
        <button
          type="submit"
          disabled={approvePending || rejectPending}
          className="studio-btn studio-btn-primary"
        >
          {approvePending ? "Approving…" : "Approve"}
        </button>
      </form>

      <form action={rejectAction} className="flex flex-col gap-2">
        <input type="hidden" name="id" value={id} />
        {rejectState && "error" in rejectState && (
          <p role="alert" className="studio-error">{rejectState.error}</p>
        )}
        <button
          type="submit"
          disabled={approvePending || rejectPending}
          className="studio-btn studio-btn-danger"
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </button>
      </form>
    </div>
  );
}
