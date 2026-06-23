"use client";

import { useTransition } from "react";
import { deleteCampaign } from "./[id]/actions";

export default function DeleteCampaignButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete campaign "${title}"?`)) return;
    startTransition(() => deleteCampaign(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="shrink-0 text-bone/20 hover:text-oxblood transition-colors text-lg leading-none disabled:opacity-40 px-1"
      title="Delete campaign"
      aria-label="Delete campaign"
    >
      {pending ? "…" : "×"}
    </button>
  );
}
