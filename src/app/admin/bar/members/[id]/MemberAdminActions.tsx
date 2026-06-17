"use client";

import { useActionState } from "react";
import { adjustBalance, toggleMemberStatus } from "./actions";
import type { Tables } from "@/types/supabase";

const INPUT = "bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";

export default function MemberAdminActions({ member }: { member: Tables<"gamer_members"> }) {
  const [adjustState, adjustAction, adjustPending] = useActionState(adjustBalance, null);
  const [statusState, statusAction, statusPending] = useActionState(toggleMemberStatus, null);

  return (
    <div className="space-y-4">
      {(adjustState?.error || statusState?.error) && (
        <div className="bg-oxblood/20 border border-oxblood/50 rounded px-4 py-3 text-sm text-bone">
          {adjustState?.error ?? statusState?.error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {/* Balance adjustment */}
        <form action={adjustAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={member.id} />
          <input
            name="minutes"
            type="number"
            placeholder="±minutes"
            className={INPUT + " w-28"}
          />
          <button
            type="submit"
            disabled={adjustPending}
            className="text-sm bg-bone/10 text-bone px-3 py-2 rounded hover:bg-bone/20 disabled:opacity-50 transition-colors"
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
            className={[
              "text-sm px-3 py-2 rounded transition-colors disabled:opacity-50",
              member.status === "active"
                ? "bg-oxblood/20 text-oxblood hover:bg-oxblood/30"
                : "bg-forest/20 text-forest hover:bg-forest/30",
            ].join(" ")}
          >
            {statusPending ? "Saving…" : member.status === "active" ? "Suspend Member" : "Reactivate Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
