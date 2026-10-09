"use client";

import { useActionState } from "react";
import { startSession } from "./actions";

const DURATIONS = [
  { value: "half_hour", label: "½ Hour",  sublabel: "$300 JMD", minutes: 30 },
  { value: "one_hour",  label: "1 Hour",  sublabel: "$600 JMD", minutes: 60 },
] as const;

export default function StartSessionForm() {
  const [state, formAction, pending] = useActionState(startSession, null);

  return (
    <form action={formAction} className="studio-card space-y-4 max-w-sm">
      {state?.error && (
        <p role="alert" className="studio-error">{state.error}</p>
      )}

      {/* Duration selector */}
      <fieldset>
        <legend className="studio-field-label">
          Session Duration
        </legend>
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
              <div className="border-2 border-line min-h-[64px] px-3 py-3 text-center peer-checked:border-paper peer-checked:bg-raised peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-yellow hover:border-muted">
                <p className="text-paper font-semibold text-[15px]">{d.label}</p>
                <p className="studio-money text-[18px]">{d.sublabel}</p>
                <p className="text-muted text-[13px]">{d.minutes} min</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="station" className="studio-field-label">
          Station <span className="text-muted font-normal">(optional)</span>
        </label>
        <select
          id="station"
          name="station"
          defaultValue=""
          className="studio-field"
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
        className="studio-btn studio-btn-primary w-full"
      >
        {pending ? "Starting…" : "Start Session"}
      </button>
    </form>
  );
}
