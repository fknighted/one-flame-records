"use client";

import { useTransition } from "react";
import { deleteMenuItem } from "./actions";

export default function DeleteMenuItemButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${name}"?`)) return;
        startTransition(() => deleteMenuItem(id));
      }}
      className="studio-btn studio-btn-danger studio-btn-sm"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
