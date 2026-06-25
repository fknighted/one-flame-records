"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTabAsRegular } from "./actions";

export default function SaveAsRegularButton({ tabId }: { tabId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await saveTabAsRegular(tabId);
          router.refresh();
        });
      }}
      className="text-xs text-bone/40 hover:text-forest transition-colors disabled:opacity-40"
    >
      {pending ? "Saving…" : "+ Add to regulars"}
    </button>
  );
}
