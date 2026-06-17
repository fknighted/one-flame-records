"use client";

import { useActionState } from "react";
import { startSession } from "./actions";

type Member = { id: string; display_name: string };

export default function StartSessionForm({ members }: { members: Member[] }) {
  const [state, formAction, pending] = useActionState(startSession, null);

  return (
    <form action={formAction} className="border border-bone/15 rounded-xl p-4 space-y-4 max-w-sm">
      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      <div>
        <label htmlFor="member_id" className="block text-sm font-medium text-bone/70 mb-1.5">
          Member <span className="text-bone/30 font-normal">(optional)</span>
        </label>
        <select
          id="member_id"
          name="member_id"
          className="w-full bg-bone/5 border border-bone/15 rounded-lg px-3 py-2.5 text-bone text-sm focus:outline-none focus:border-ochre/50"
        >
          <option value="">Drop-in (no account)</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.display_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="station" className="block text-sm font-medium text-bone/70 mb-1.5">
          Station <span className="text-bone/30 font-normal">(optional)</span>
        </label>
        <input
          id="station"
          name="station"
          type="text"
          placeholder="e.g. PS5, PC 1, Switch"
          className="w-full bg-bone/5 border border-bone/15 rounded-lg px-3 py-2.5 text-bone placeholder:text-bone/25 text-sm focus:outline-none focus:border-ochre/50"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-ochre text-ink font-semibold py-2.5 rounded-lg text-sm hover:bg-ochre/90 transition-colors disabled:opacity-50"
      >
        {pending ? "Starting…" : "Start Session"}
      </button>
    </form>
  );
}
