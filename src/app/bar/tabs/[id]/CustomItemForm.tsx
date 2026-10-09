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
        <p role="alert" className="studio-error">{state.error}</p>
      )}
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          placeholder="Description (optional)"
          className="studio-field flex-1 min-w-0"
          aria-label="Description"
        />
        <input
          name="price"
          type="number"
          min="1"
          step="1"
          placeholder="J$0"
          required
          className="studio-field w-24 text-right"
          aria-label="Price in Jamaican dollars"
        />
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-secondary shrink-0"
        >
          {pending ? "…" : "Add"}
        </button>
      </div>
    </form>
  );
}
