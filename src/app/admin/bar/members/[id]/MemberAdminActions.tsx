"use client";

import { useActionState, useEffect, useRef } from "react";
import { adjustBalance, toggleMemberStatus } from "./actions";
import type { Tables } from "@/types/supabase";
import { useToast } from "@/components/ToastProvider";

const INPUT = "studio-field";

export default function MemberAdminActions({ member }: { member: Tables<"gamer_members"> }) {
  const [adjustState, adjustAction, adjustPending] = useActionState(adjustBalance, null);
  const [statusState, statusAction, statusPending] = useActionState(toggleMemberStatus, null);
  const { showToast } = useToast();
  const prevAdjPendingRef = useRef(false);
  const prevStatusPendingRef = useRef(false);

  useEffect(() => {
    if (prevAdjPendingRef.current && !adjustPending && adjustState === null) {
      showToast("Balance updated");
    }
    prevAdjPendingRef.current = adjustPending;
  }, [adjustPending, adjustState, showToast]);

  useEffect(() => {
    if (prevStatusPendingRef.current && !statusPending && statusState === null) {
      showToast(member.status === "active" ? "Member suspended" : "Member reactivated");
    }
    prevStatusPendingRef.current = statusPending;
  }, [statusPending, statusState, member.status, showToast]);

  return (
    <div className="space-y-4">
      {(adjustState?.error || statusState?.error) && (
        <div role="alert" className="studio-error">
          {adjustState?.error ?? statusState?.error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Balance adjustment */}
        <form action={adjustAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={member.id} />
          <input
            name="minutes"
            type="number"
            placeholder="±minutes"
            aria-label="Minutes to add or remove"
            className={INPUT + " w-32"}
          />
          <button
            type="submit"
            disabled={adjustPending}
            className="studio-btn studio-btn-secondary"
          >
            Adjust Balance
          </button>
        </form>

        {/* Suspend / reactivate */}
        <form action={statusAction}>
          <input type="hidden" name="id" value={member.id} />
          <input type="hidden" name="status" value={member.status === "active" ? "suspended" : "active"} />
          <button
            type="submit"
            disabled={statusPending}
            className={
              member.status === "active"
                ? "studio-btn studio-btn-danger"
                : "studio-btn studio-btn-secondary"
            }
          >
            {statusPending ? "Saving…" : member.status === "active" ? "Suspend Member" : "Reactivate Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
