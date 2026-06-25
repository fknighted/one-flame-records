"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCustomItem } from "./actions";

export default function CustomItemForm({ tabId }: { tabId: string }) {
  const [state, action, pending] = useActionState(addCustomItem, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful add
  useEffect(() => {
    if (state === null && !pending) formRef.current?.reset();
  }, [state, pending]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="tab_id" value={tabId} />
      {state?.error && (
        <p className="text-xs text-oxblood">{state.error}</p>
      )}
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="Description (optional)"
          className="flex-1 min-w-0 bg-bone/5 border border-bone/15 rounded px-3 py-2 text-bone placeholder:text-bone/25 text-sm focus:outline-none focus:border-ochre/50"
        />
        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="J$0.00"
          required
          className="w-24 bg-bone/5 border border-bone/15 rounded px-3 py-2 text-bone placeholder:text-bone/25 text-sm focus:outline-none focus:border-ochre/50 text-right"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 bg-bone/10 hover:bg-bone/15 text-bone text-sm font-medium px-3 py-2 rounded transition-colors disabled:opacity-50"
        >
          {pending ? "…" : "Add"}
        </button>
      </div>
    </form>
  );
}
