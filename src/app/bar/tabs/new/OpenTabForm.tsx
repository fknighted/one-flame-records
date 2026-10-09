"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
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
        <p role="alert" className="studio-error">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="name" className="studio-field-label">
          Customer Name <span>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          list={hasRegulars ? "regulars-list" : undefined}
          autoFocus
          value={nameInput}
          onChange={e => handleNameChange(e.target.value)}
          placeholder={hasRegulars ? "Type a name or pick a regular…" : "e.g. Table 3, Jay, Walk-in"}
          className="studio-field"
        />
        {hasRegulars && (
          <datalist id="regulars-list">
            {regulars.map(r => (
              <option key={r.id} value={r.name} />
            ))}
          </datalist>
        )}
        {hint && (
          <p className="studio-hint mt-1.5">{hint}</p>
        )}
        {regularId && (
          <p className="mt-1.5"><span className="studio-chip studio-chip-ok">Regular customer</span></p>
        )}
        <input type="hidden" name="regular_id" value={regularId ?? ""} />
      </div>

      <div>
        <label htmlFor="notes" className="studio-field-label">
          Notes <span className="text-muted font-normal">(optional)</span>
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="e.g. VIP, allergies, seat number"
          className="studio-field"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !nameInput.trim()}
        className="studio-btn studio-btn-primary w-full"
      >
        {pending ? "Opening…" : "Open Tab"}
      </button>

      {hasRegulars && (
        <p className="text-center text-[14px]">
          <Link href="/bar/regulars" className="studio-link inline-flex min-h-[44px] items-center">Manage regulars</Link>
        </p>
      )}
    </form>
  );
}
