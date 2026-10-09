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
        <span role="alert" className="studio-error text-[13px]">{incState?.error ?? decState?.error}</span>
      )}
      <form action={decAction}>
        <input type="hidden" name="tab_item_id" value={tabItemId} />
        <input type="hidden" name="tab_id" value={tabId} />
        <button
          type="submit"
          disabled={anyPending}
          className="studio-btn studio-btn-secondary !min-h-[44px] !w-11 !p-0 text-[18px]"
          aria-label={quantity <= 1 ? "Remove item" : "Decrease quantity"}
          title={quantity <= 1 ? "Remove item" : "Decrease quantity"}
        >
          −
        </button>
      </form>
      <span className="studio-count text-[20px] min-w-[24px] text-center">{quantity}</span>
      <form action={incAction}>
        <input type="hidden" name="tab_item_id" value={tabItemId} />
        <input type="hidden" name="tab_id" value={tabId} />
        <button
          type="submit"
          disabled={anyPending}
          className="studio-btn studio-btn-secondary !min-h-[44px] !w-11 !p-0 text-[18px]"
          aria-label="Increase quantity"
          title="Increase quantity"
        >
          +
        </button>
      </form>
    </div>
  );
}
