"use client";

import { useTransition } from "react";

export default function DeletePostButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    startTransition(() => action());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
