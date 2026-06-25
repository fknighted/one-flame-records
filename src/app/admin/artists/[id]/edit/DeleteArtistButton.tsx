"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArtist } from "@/app/admin/artists/actions";

export default function DeleteArtistButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
        startTransition(async () => {
          await deleteArtist(id);
          router.push("/admin/artists");
        });
      }}
      className="text-sm text-oxblood/50 hover:text-oxblood transition-colors disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete artist"}
    </button>
  );
}
