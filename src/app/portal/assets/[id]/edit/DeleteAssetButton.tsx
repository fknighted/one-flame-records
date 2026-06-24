"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAsset } from "../../actions";

export default function DeleteAssetButton({ assetId, title }: { assetId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteAsset(assetId);
      router.push("/portal/assets");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="text-sm text-oxblood/60 hover:text-oxblood transition-colors disabled:opacity-40"
    >
      {pending ? "Deleting…" : "Delete asset"}
    </button>
  );
}
