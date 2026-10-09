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
      className="studio-btn studio-btn-danger studio-btn-sm"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
