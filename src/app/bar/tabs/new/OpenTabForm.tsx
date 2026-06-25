"use client";

import { useActionState, useState } from "react";
import { openTab } from "./actions";

type Regular = { id: string; name: string; phone: string | null; notes: string | null };

export default function OpenTabForm({ regulars }: { regulars: Regular[] }) {
  const [state, formAction, pending] = useActionState(openTab, null);
  const [nameInput, setNameInput]     = useState("");
  const [regularId, setRegularId]     = useState<string | null>(null);
  const [hint, setHint]               = useState<string | null>(null);

  function handleNameChange(value: string) {
    setNameInput(value);
    const match = regulars.find(r => r.name.toLowerCase() === value.toLowerCase());
    if (match) {
      setRegularId(match.id);
      setHint(match.notes ?? match.phone ?? null);
    } else {
      setRegularId(null);
      setHint(null);
    }
  }

  const hasRegulars = regulars.length > 0;

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
          list={hasRegulars ? "regulars-list" : undefined}
          autoFocus
          autoComplete="off"
          value={nameInput}
          onChange={e => handleNameChange(e.target.value)}
          placeholder={hasRegulars ? "Type a name or pick a regular…" : "e.g. Table 3, Jay, Walk-in"}
          className="w-full bg-bone/5 border border-bone/15 rounded-lg px-4 py-3 text-bone placeholder:text-bone/25 text-base focus:outline-none focus:border-ochre/50 transition-colors"
        />
        {hasRegulars && (
          <datalist id="regulars-list">
            {regulars.map(r => (
              <option key={r.id} value={r.name} />
            ))}
          </datalist>
        )}
        {hint && (
          <p className="text-xs text-ochre/70 mt-1.5 px-1">{hint}</p>
        )}
        {regularId && (
          <p className="text-xs text-forest/70 mt-1 px-1">Regular customer ✓</p>
        )}
        <input type="hidden" name="regular_id" value={regularId ?? ""} />
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
        disabled={pending || !nameInput.trim()}
        className="w-full bg-ochre text-ink font-semibold text-base py-3.5 rounded-lg hover:bg-ochre/90 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {pending ? "Opening…" : "Open Tab"}
      </button>

      {hasRegulars && (
        <p className="text-center text-xs text-bone/30">
          <a href="/bar/regulars" className="hover:text-bone/60 transition-colors">Manage regulars →</a>
        </p>
      )}
    </form>
  );
}
