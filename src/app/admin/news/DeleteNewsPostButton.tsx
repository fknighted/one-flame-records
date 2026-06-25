"use client";

import { useTransition } from "react";
import { deleteNewsPost } from "./[id]/edit/actions";

export default function DeleteNewsPostButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete post "${title}"?`)) return;
        startTransition(() => deleteNewsPost(id));
      }}
      className="text-xs text-bone/25 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Delete post"
    >
      {pending ? "…" : "×"}
    </button>
  );
}
