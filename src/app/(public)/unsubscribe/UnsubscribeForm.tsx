"use client";

import { useState } from "react";
import { unsubscribeEmail } from "./actions";

interface UnsubscribeFormProps {
  email: string;
}

export default function UnsubscribeForm({ email }: UnsubscribeFormProps) {
  const [state, setState] = useState<{ error?: string; done?: boolean } | null>(null);
  const [pending, setPending] = useState(false);

  if (state?.done) {
    return (
      <div className="text-center space-y-4">
        <p className="text-ink/70 text-sm">
          You've been unsubscribed from the One Flame Records newsletter.
        </p>
        <p className="text-ink/40 text-xs">You won't receive any further emails from us.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const result = await unsubscribeEmail(email);
    setPending(false);
    if (result.error) {
      setState({ error: result.error });
    } else {
      setState({ done: true });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {state?.error && (
        <p className="text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}
      <p className="text-ink/60 text-sm text-center break-all">{email}</p>
      <button
        type="submit"
        disabled={pending}
        className="w-full border border-ochre text-ink font-semibold text-base py-3 rounded-xl hover:bg-ochre/10 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </form>
  );
}
