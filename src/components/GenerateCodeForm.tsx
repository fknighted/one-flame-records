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
            className="flex-1 bg-bone/10 border border-bone/20 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/40 focus:outline-none focus:border-ochre"
          />
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-ochre text-ink font-semibold text-sm rounded hover:bg-ochre/90 disabled:opacity-50 transition-colors whitespace-nowrap"
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
          <p className="text-xs text-bone/50">
            Artists with the old QR will not be able to apply.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="self-start px-4 py-2 border border-bone/30 text-bone/70 text-sm rounded hover:border-ochre hover:text-ochre disabled:opacity-50 transition-colors"
          >
            {pending ? "Rotating…" : "Rotate code"}
          </button>
        </div>
      )}
      {state?.error && (
        <p className="mt-2 text-sm text-red-400">{state.error}</p>
      )}
    </form>
  );
}
