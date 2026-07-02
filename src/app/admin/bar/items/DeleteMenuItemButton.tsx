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
      className="text-xs text-rose/50 hover:text-rose transition-colors disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
