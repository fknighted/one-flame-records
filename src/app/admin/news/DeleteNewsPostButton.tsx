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
      className="studio-btn studio-btn-danger studio-btn-sm"
      title="Delete post"
      aria-label="Delete post"
    >
      {pending ? "…" : "×"}
    </button>
  );
}
