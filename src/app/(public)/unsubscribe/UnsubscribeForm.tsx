"use client";

import { useState } from "react";
import { unsubscribeEmail } from "./actions";
import { buttonClasses } from "@/lib/sound-system";

interface UnsubscribeFormProps {
  email: string;
}

export default function UnsubscribeForm({ email }: UnsubscribeFormProps) {
  const [state, setState] = useState<{ error?: string; done?: boolean } | null>(null);
  const [pending, setPending] = useState(false);

  if (state?.done) {
    return (
      <div className="space-y-3" role="status">
        <p className="type-body">
          You&apos;ve been unsubscribed from the One Flame Records newsletter.
        </p>
        <p className="type-body-sm">You won&apos;t receive any further emails from us.</p>
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
        <p role="alert" className="bg-red text-paper type-body-sm px-4 py-3">
          {state.error}
        </p>
      )}
      <p className="type-body-sm font-semibold break-all">{email}</p>
      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("dark", "paper", "w-full")}
      >
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </form>
  );
}
