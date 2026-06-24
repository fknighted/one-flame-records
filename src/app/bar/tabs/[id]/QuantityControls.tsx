"use client";

import { useActionState } from "react";
import { incrementTabItem, decrementTabItem } from "./actions";

export default function QuantityControls({
  tabItemId,
  tabId,
  quantity,
}: {
  tabItemId: string;
  tabId: string;
  quantity: number;
}) {
  const [incState, incAction, incPending] = useActionState(incrementTabItem, null);
  const [decState, decAction, decPending] = useActionState(decrementTabItem, null);
  const anyPending = incPending || decPending;

  return (
    <div className="flex items-center gap-1 shrink-0">
      {(incState?.error || decState?.error) && (
        <span className="text-red-400 text-xs">{incState?.error ?? decState?.error}</span>
      )}
      <form action={decAction}>
        <input type="hidden" name="tab_item_id" value={tabItemId} />
        <input type="hidden" name="tab_id" value={tabId} />
        <button
          type="submit"
          disabled={anyPending}
          className="w-6 h-6 rounded border border-bone/20 text-bone/50 hover:text-bone hover:border-bone/40 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-30"
          title={quantity <= 1 ? "Remove item" : "Decrease quantity"}
        >
          −
        </button>
      </form>
      <span className="text-bone/50 text-xs w-4 text-center tabular-nums">{quantity}</span>
      <form action={incAction}>
        <input type="hidden" name="tab_item_id" value={tabItemId} />
        <input type="hidden" name="tab_id" value={tabId} />
        <button
          type="submit"
          disabled={anyPending}
          className="w-6 h-6 rounded border border-bone/20 text-bone/50 hover:text-bone hover:border-bone/40 flex items-center justify-center text-sm font-medium transition-colors disabled:opacity-30"
          title="Increase quantity"
        >
          +
        </button>
      </form>
    </div>
  );
}
