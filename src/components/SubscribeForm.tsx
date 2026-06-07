"use client";

import { useState, useTransition } from "react";
import { subscribeEmail } from "@/app/(public)/subscribe/actions";

export default function SubscribeForm() {
  const [email, setEmail]     = useState("");
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await subscribeEmail(email);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
        setEmail("");
      }
    });
  }

  if (done) {
    return (
      <p className="text-sm text-forest font-medium">
        ✓ You&apos;re subscribed.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 rounded bg-bone/5 border border-bone/15 px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/50"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 disabled:opacity-50 transition-colors"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {error && <p className="text-xs text-oxblood">{error}</p>}
    </form>
  );
}
