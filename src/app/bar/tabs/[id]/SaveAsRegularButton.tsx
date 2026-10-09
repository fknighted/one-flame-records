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
        className="studio-btn studio-btn-quiet studio-btn-sm"
      >
        {pending ? "Saving…" : "+ Add to regulars"}
      </button>
      {error && <span role="alert" className="studio-error text-[13px]">{error}</span>}
    </span>
  );
}
