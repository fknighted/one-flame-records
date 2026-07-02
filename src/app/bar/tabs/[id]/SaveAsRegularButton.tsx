"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { saveTabAsRegular } from "./actions";

export default function SaveAsRegularButton({ tabId }: { tabId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await saveTabAsRegular(tabId);
            if (result?.error) { setError(result.error); return; }
            router.refresh();
          });
        }}
        className="text-xs text-bone/60 hover:text-sage transition-colors disabled:opacity-40"
      >
        {pending ? "Saving…" : "+ Add to regulars"}
      </button>
      {error && <span className="text-xs text-rose">{error}</span>}
    </span>
  );
}
