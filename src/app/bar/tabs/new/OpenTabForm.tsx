"use client";

import { useActionState } from "react";
import { openTab } from "./actions";

export default function OpenTabForm() {
  const [state, formAction, pending] = useActionState(openTab, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-bone/70 mb-1.5">
          Customer Name <span className="text-oxblood">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoFocus
          autoComplete="off"
          placeholder="e.g. Table 3, Jay, Walk-in"
          className="w-full bg-bone/5 border border-bone/15 rounded-lg px-4 py-3 text-bone placeholder:text-bone/25 text-base focus:outline-none focus:border-ochre/50 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-bone/70 mb-1.5">
          Notes <span className="text-bone/30 font-normal">(optional)</span>
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="e.g. VIP, allergies, seat number"
          className="w-full bg-bone/5 border border-bone/15 rounded-lg px-4 py-3 text-bone placeholder:text-bone/25 text-base focus:outline-none focus:border-ochre/50 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ochre text-ink font-semibold text-base py-3.5 rounded-lg hover:bg-ochre/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {pending ? "Opening…" : "Open Tab"}
      </button>
    </form>
  );
}
