"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArtist } from "./actions";

export default function DeleteArtistButton({
  id,
  name,
  className,
  label = "×",
  pendingLabel = "…",
}: {
  id: string;
  name: string;
  className?: string;
  label?: string;
  pendingLabel?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
        startTransition(async () => {
          const result = await deleteArtist(id);
          if (result?.error) { alert(result.error); return; }
          router.push("/admin/artists");
        });
      }}
      className={className}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
