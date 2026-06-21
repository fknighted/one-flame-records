"use client";

import { useActionState, useState } from "react";
import { closeTab, voidTab } from "./actions";
import { formatCents } from "@/lib/bar/pos";

export default function TabControls({ tabId, total }: { tabId: string; total: number }) {
  const [showClose, setShowClose] = useState(false);
  const [showVoid,  setShowVoid]  = useState(false);
  const [closeState, closeAction, closePending] = useActionState(closeTab, null);
  const [voidState,  voidAction,  voidPending]  = useActionState(voidTab, null);

  if (showVoid) {
    return (
      <form action={voidAction} className="space-y-3">
        <input type="hidden" name="tab_id" value={tabId} />
        <p className="text-sm text-bone/60 text-center">
          Void this tab? All items will be removed and no payment recorded.
        </p>
        {voidState?.error && (
          <p className="text-sm text-red-400 text-center">{voidState.error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowVoid(false)}
            className="flex-1 border border-bone/20 text-bone/60 py-2.5 rounded-lg text-sm hover:text-bone transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={voidPending}
            className="flex-1 bg-red-900/60 border border-red-700/40 text-red-200 py-2.5 rounded-lg text-sm font-medium hover:bg-red-900/80 transition-colors disabled:opacity-50"
          >
            {voidPending ? "Voiding…" : "Confirm Void"}
          </button>
        </div>
      </form>
    );
  }

  if (showClose) {
    return (
      <form action={closeAction} className="space-y-3">
        <input type="hidden" name="tab_id" value={tabId} />
        <p className="text-sm font-semibold text-bone text-center">
          Total: <span className="text-ochre">{formatCents(total)}</span>
        </p>
        <p className="text-xs text-bone/50 text-center">How was this paid?</p>
        {closeState?.error && (
          <p className="text-sm text-red-400 text-center">{closeState.error}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {(["cash", "comp"] as const).map(method => (
            <button
              key={method}
              type="submit"
              name="payment_method"
              value={method}
              disabled={closePending}
              className="py-3 rounded-lg border border-ochre/30 text-bone text-sm font-medium hover:bg-ochre/10 hover:border-ochre/60 active:scale-[0.97] transition-all disabled:opacity-50 capitalize"
            >
              {method}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowClose(false)}
          className="w-full text-sm text-bone/40 hover:text-bone/60 transition-colors py-1"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => setShowVoid(true)}
        className="border border-bone/15 text-bone/40 hover:text-red-400 hover:border-red-400/30 px-3 py-2.5 rounded-lg text-sm transition-colors"
      >
        Void
      </button>
      <button
        type="button"
        onClick={() => setShowClose(true)}
        className="flex-1 bg-ochre text-ink font-semibold py-2.5 rounded-lg text-sm hover:bg-ochre/90 active:scale-[0.98] transition-all"
      >
        Close Tab — {formatCents(total)}
      </button>
    </div>
  );
}
