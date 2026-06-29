"use client";

import { useTransition } from "react";
import { deleteNewsPost } from "./actions";

export default function DeleteNewsPostButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete post "${title}"?`)) return;
        startTransition(async () => {
          try {
            await deleteNewsPost(id);
          } catch {
            alert("Delete failed. Please try again.");
          }
        });
      }}
      className="text-xs text-bone/25 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Delete post"
    >
      {pending ? "…" : "×"}
    </button>
  );
}
