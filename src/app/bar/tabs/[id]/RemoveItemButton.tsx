"use client";

import { useActionState, useRef } from "react";
import { removeTabItem } from "./actions";

export default function RemoveItemButton({ tabItemId, tabId }: { tabItemId: string; tabId: string }) {
  const [state, formAction, pending] = useActionState(removeTabItem, null);
  const formRef = useRef<HTMLFormElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);

  // Cancelling a sale restores stock and is logged to the voids ledger. Offer an
  // optional reason; pressing Cancel on the prompt keeps the item (mis-tap guard).
  function handleClick() {
    const r = window.prompt("Cancel this item? Add an optional reason, or leave blank. Press Cancel to keep it.");
    if (r === null) return;
    if (reasonRef.current) reasonRef.current.value = r.trim();
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction}>
      <input type="hidden" name="tab_item_id" value={tabItemId} />
      <input type="hidden" name="tab_id" value={tabId} />
      <input type="hidden" name="reason" ref={reasonRef} defaultValue="" />
      {state?.error && (
        <span role="alert" className="studio-error text-[13px] absolute bottom-full left-0 whitespace-nowrap mb-1">
          {state.error}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="studio-btn studio-btn-danger !min-h-[44px] !w-11 !p-0 text-[18px] shrink-0"
        aria-label="Remove item"
      >
        ×
      </button>
    </form>
  );
}
