"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateBudget } from "./actions";
import { useToast } from "@/components/ToastProvider";

export function BudgetForm({ currentBudget }: { currentBudget: number }) {
  const [state, action, pending] = useActionState(updateBudget, null);
  const { showToast } = useToast();
  const prevPendingRef = useRef(false);

  useEffect(() => {
    if (prevPendingRef.current && !pending && state === null) {
      showToast("Budget saved");
    }
    prevPendingRef.current = pending;
  }, [pending, state, showToast]);

  return (
    <form action={action} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs text-bone/50 mb-1.5">
          Monthly cap (USD)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone/40 text-sm">$</span>
          <input
            type="number"
            name="monthly_video_budget_usd"
            defaultValue={currentBudget}
            min="0"
            step="10"
            required
            className="w-full rounded border border-bone/20 bg-bone/5 pl-7 pr-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {pending ? "Saving…" : "Save budget"}
      </button>
      {state && "error" in state && (
        <p className="text-xs text-oxblood">{state.error}</p>
      )}
    </form>
  );
}
