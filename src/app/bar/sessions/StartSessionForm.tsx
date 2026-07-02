"use client";

import { useActionState } from "react";
import { startSession } from "./actions";

type Member = { id: string; display_name: string };

const DURATIONS = [
  { value: "half_hour", label: "½ Hour",  sublabel: "$300 JMD", minutes: 30 },
  { value: "one_hour",  label: "1 Hour",  sublabel: "$600 JMD", minutes: 60 },
] as const;

export default function StartSessionForm({ members }: { members: Member[] }) {
  const [state, formAction, pending] = useActionState(startSession, null);

  return (
    <form action={formAction} className="border border-bone/15 rounded-xl p-4 space-y-4 max-w-sm">
      {state?.error && (
        <p className="text-sm text-red-400">{state.error}</p>
      )}

      {/* Duration selector */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Session Duration
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DURATIONS.map((d, i) => (
            <label key={d.value} className="cursor-pointer">
              <input
                type="radio"
                name="duration_type"
                value={d.value}
                defaultChecked={i === 0}
                className="sr-only peer"
              />
              <div className="border border-bone/15 rounded-lg px-3 py-3 text-center transition-colors peer-checked:border-ochre peer-checked:bg-ochre/10 hover:border-bone/30">
                <p className="text-bone font-semibold text-sm">{d.label}</p>
                <p className="text-ochre text-xs font-mono">{d.sublabel}</p>
                <p className="text-bone/50 text-xs">{d.minutes} min</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="member_id" className="block text-sm font-medium text-bone/70 mb-1.5">
          Member <span className="text-bone/50 font-normal">(optional)</span>
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
          Station <span className="text-bone/50 font-normal">(optional)</span>
        </label>
        <select
          id="station"
          name="station"
          defaultValue=""
          className="w-full bg-bone/5 border border-bone/15 rounded-lg px-3 py-2.5 text-bone text-sm focus:outline-none focus:border-ochre/50"
        >
          <option value="">— Select station —</option>
          <option value="Xbox 1">Xbox 1</option>
          <option value="Xbox 2">Xbox 2</option>
          <option value="Xbox 3">Xbox 3</option>
          <option value="Nintendo Switch">Nintendo Switch</option>
        </select>
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
