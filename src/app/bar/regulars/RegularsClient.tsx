"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { createRegular, updateRegular, deleteRegular } from "./actions";

type Regular = { id: string; name: string; phone: string | null; notes: string | null };

function AddForm() {
  const [state, action, pending] = useActionState(createRegular, null);
  return (
    <form action={action} className="studio-card space-y-3">
      <h2 className="studio-label">Add Regular</h2>
      {state?.error && <p role="alert" className="studio-error">{state.error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          name="name"
          required
          aria-label="Name"
          placeholder="Name *"
          className="studio-field"
        />
        <input
          name="phone"
          type="tel"
          aria-label="Phone"
          placeholder="Phone (optional)"
          className="studio-field"
        />
      </div>
      <input
        name="notes"
        aria-label="Notes"
        placeholder="Notes (optional — e.g. usual order, seat preference)"
        className="studio-field"
      />
      <button
        type="submit"
        disabled={pending}
        className="studio-btn studio-btn-primary"
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
            {state?.error && <p role="alert" className="studio-error">{state.error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                name="name"
                defaultValue={regular.name}
                required
                aria-label="Name"
                className="studio-field"
              />
              <input
                name="phone"
                type="tel"
                aria-label="Phone"
                defaultValue={regular.phone ?? ""}
                placeholder="Phone"
                className="studio-field"
              />
            </div>
            <input
              name="notes"
              aria-label="Notes"
              defaultValue={regular.notes ?? ""}
              placeholder="Notes"
              className="studio-field"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="studio-btn studio-btn-secondary studio-btn-sm"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="studio-btn studio-btn-quiet studio-btn-sm"
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
    <tr>
      <td className="font-semibold [overflow-wrap:anywhere]">{regular.name}</td>
      <td className="studio-figures text-muted">{regular.phone ?? "—"}</td>
      <td className="text-muted [overflow-wrap:anywhere]">{regular.notes ?? "—"}</td>
      <td className="is-num">
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="studio-btn studio-btn-secondary studio-btn-sm"
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
            className="studio-btn studio-btn-danger studio-btn-sm"
          >
            {deletePending ? "…" : "Remove"}
          </button>
          {deleteError && <span role="alert" className="studio-error text-[13px]">{deleteError}</span>}
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
        <div className="studio-empty"><p className="studio-empty-body">No regulars yet — add the first one above.</p></div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[500px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Notes</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {regulars.map(r => <RegularRow key={r.id} regular={r} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
