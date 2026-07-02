"use client";

import { useTransition } from "react";
import { deleteJob } from "./actions";

export default function DeleteJobButton({ id, artistName }: { id: string; artistName: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete job for "${artistName}"?`)) return;
        startTransition(async () => {
          try {
            await deleteJob(id);
          } catch {
            alert("Delete failed. Please try again.");
          }
        });
      }}
      className="text-xs text-bone/50 hover:text-red-400 transition-colors disabled:opacity-50"
      title="Delete job"
    >
      {pending ? "…" : "×"}
    </button>
  );
}
