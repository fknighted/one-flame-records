"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEvent } from "@/app/admin/events/actions";

export default function DeleteEventButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this event?")) return;
        startTransition(async () => {
          await deleteEvent(id);
          router.push("/admin/events");
        });
      }}
      className="text-sm text-oxblood/60 hover:text-oxblood transition-colors disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete event"}
    </button>
  );
}
