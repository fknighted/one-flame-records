"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { createRegular, updateRegular, deleteRegular } from "./actions";

type Regular = { id: string; name: string; phone: string | null; notes: string | null };

function AddForm() {
  const [state, action, pending] = useActionState(createRegular, null);
  return (
    <form action={action} className="border border-bone/10 rounded-lg p-4 space-y-3">
      <p className="text-xs font-semibold text-bone/40 uppercase tracking-wider">Add Regular</p>
      {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="name"
          required
          placeholder="Name *"
          className="bg-bone/5 border border-bone/15 rounded-lg px-3 py-2 text-bone placeholder:text-bone/25 text-sm focus:outline-none focus:border-ochre/50"
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone (optional)"
          className="bg-bone/5 border border-bone/15 rounded-lg px-3 py-2 text-bone placeholder:text-bone/25 text-sm focus:outline-none focus:border-ochre/50"
        />
      </div>
      <input
        name="notes"
        placeholder="Notes (optional — e.g. usual order, seat preference)"
        className="w-full bg-bone/5 border border-bone/15 rounded-lg px-3 py-2 text-bone placeholder:text-bone/25 text-sm focus:outline-none focus:border-ochre/50"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-ochre text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-ochre/90 transition-colors disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add Regular"}
      </button>
    </form>
  );
}

function RegularRow({ regular }: { regular: Regular }) {
  const [editing, setEditing] = useState(false);
  const action = updateRegular.bind(null, regular.id);
  const [state, formAction, pending] = useActionState(action, null);
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close edit form automatically after a successful save
  useEffect(() => {
    if (state === null && !pending && editing) setEditing(false);
  }, [state, pending, editing]);

  if (editing) {
    return (
      <tr>
        <td colSpan={4} className="px-4 py-3">
          <form action={formAction} className="space-y-2">
            {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                name="name"
                defaultValue={regular.name}
                required
                className="bg-bone/5 border border-bone/15 rounded px-3 py-1.5 text-bone text-sm focus:outline-none focus:border-ochre/50"
              />
              <input
                name="phone"
                type="tel"
                defaultValue={regular.phone ?? ""}
                placeholder="Phone"
                className="bg-bone/5 border border-bone/15 rounded px-3 py-1.5 text-bone text-sm focus:outline-none focus:border-ochre/50"
              />
            </div>
            <input
              name="notes"
              defaultValue={regular.notes ?? ""}
              placeholder="Notes"
              className="w-full bg-bone/5 border border-bone/15 rounded px-3 py-1.5 text-bone text-sm focus:outline-none focus:border-ochre/50"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="bg-ochre text-ink text-xs font-semibold px-3 py-1.5 rounded hover:bg-ochre/90 transition-colors disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-bone/40 hover:text-bone transition-colors px-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-bone/3 transition-colors">
      <td className="px-4 py-3 text-bone font-medium">{regular.name}</td>
      <td className="px-4 py-3 text-bone/50 text-sm">{regular.phone ?? "—"}</td>
      <td className="px-4 py-3 text-bone/40 text-sm">{regular.notes ?? "—"}</td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-ochre/60 hover:text-ochre transition-colors"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (!confirm(`Remove ${regular.name} from regulars?`)) return;
              setDeleteError(null);
              startDelete(async () => {
                const result = await deleteRegular(regular.id);
                if (result?.error) setDeleteError(result.error);
              });
            }}
            disabled={deletePending}
            className="text-xs text-oxblood/40 hover:text-oxblood transition-colors disabled:opacity-50"
          >
            {deletePending ? "…" : "Remove"}
          </button>
          {deleteError && <span className="text-xs text-oxblood">{deleteError}</span>}
        </span>
      </td>
    </tr>
  );
}

export default function RegularsClient({ regulars }: { regulars: Regular[] }) {
  return (
    <div className="space-y-6">
      <AddForm />

      {regulars.length === 0 ? (
        <p className="text-bone/30 text-sm text-center py-8">No regulars yet — add the first one above.</p>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead className="border-b border-bone/10 bg-bone/3">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Notes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/10">
              {regulars.map(r => <RegularRow key={r.id} regular={r} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
