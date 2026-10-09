"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAsset } from "../../actions";

export default function DeleteAssetButton({ assetId, title }: { assetId: string; title: string }) {
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setErrorMsg(null);
    startTransition(async () => {
      const result = await deleteAsset(assetId);
      if (result?.error) {
        setErrorMsg(result.error);
        return;
      }
      router.push("/portal/assets");
      router.refresh();
    });
  }

  return (
    <div>
      {errorMsg && <p role="alert" className="studio-error mb-2">{errorMsg}</p>}
      <button
        onClick={handleDelete}
        disabled={pending}
        className="studio-btn studio-btn-danger studio-btn-sm"
      >
        {pending ? "Deleting…" : "Delete asset"}
      </button>
    </div>
  );
}
