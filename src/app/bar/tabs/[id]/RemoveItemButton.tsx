"use client";

import { useActionState } from "react";
import { removeTabItem } from "./actions";

export default function RemoveItemButton({ tabItemId, tabId }: { tabItemId: string; tabId: string }) {
  const [state, formAction, pending] = useActionState(removeTabItem, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="tab_item_id" value={tabItemId} />
      <input type="hidden" name="tab_id" value={tabId} />
      {state?.error && (
        <span className="text-xs text-red-400 absolute bottom-full left-0 whitespace-nowrap mb-1">
          {state.error}
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        className="text-bone/52 hover:text-red-400 transition-colors text-lg leading-none shrink-0 w-6 h-6 flex items-center justify-center disabled:opacity-40"
        aria-label="Remove item"
      >
        ×
      </button>
    </form>
  );
}
