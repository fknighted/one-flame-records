"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/admin/events/actions";

export default function DeleteEventButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this event?")) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteEvent(id);
            if (result?.error) { setError(result.error); return; }
            router.push("/admin/events");
          });
        }}
        className="studio-btn studio-btn-danger studio-btn-sm"
      >
        {pending ? "Deleting…" : "Delete event"}
      </button>
      {error && <p role="alert" className="studio-error">{error}</p>}
    </div>
  );
}
