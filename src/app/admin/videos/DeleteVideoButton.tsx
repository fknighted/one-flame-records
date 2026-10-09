"use client";

import { useTransition } from "react";
import { deleteVideo } from "./actions";

export default function DeleteVideoButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete video "${title}"?`)) return;
        startTransition(async () => {
          try {
            await deleteVideo(id);
          } catch {
            alert("Delete failed. Please try again.");
          }
        });
      }}
      className="studio-btn studio-btn-danger studio-btn-sm"
      title="Delete video"
      aria-label="Delete video"
    >
      {pending ? "…" : "×"}
    </button>
  );
}
