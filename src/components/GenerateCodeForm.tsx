"use client";

import { useActionState } from "react";
import { generateCode, type ActionState } from "@/app/admin/codes/actions";

export default function GenerateCodeForm({
  mode,
  defaultLabel,
}: {
  mode: "generate" | "rotate";
  defaultLabel?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    generateCode,
    null
  );

  return (
    <form action={action}>
      {mode === "generate" ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            name="label"
            type="text"
            placeholder="Label (e.g. Business card v1)"
            defaultValue={defaultLabel}
            className="studio-field flex-1"
          />
          <button
            type="submit"
            disabled={pending}
            className="studio-btn studio-btn-primary whitespace-nowrap"
          >
            {pending ? "Generating…" : "Generate code"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            name="label"
            type="hidden"
            value={defaultLabel ?? "Rotation"}
          />
          <p className="studio-hint">
            Artists with the old QR will not be able to apply.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="studio-btn studio-btn-secondary self-start"
          >
            {pending ? "Rotating…" : "Rotate code"}
          </button>
        </div>
      )}
      {state?.error && (
        <p role="alert" className="studio-error mt-2">{state.error}</p>
      )}
    </form>
  );
}
