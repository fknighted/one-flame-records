"use client";

import { useId, useState, useTransition } from "react";
import { subscribeEmail } from "@/app/(public)/subscribe/actions";
import { FIELD_CLASS, FIELD_LABEL_CLASS, buttonClasses } from "@/lib/sound-system";

// Sits on a paper block: 2px black field, red focus ring, black button.
export default function SubscribeForm() {
  const [email, setEmail]     = useState("");
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const id = useId();

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
      <p className="type-body font-semibold text-green" role="status">
        You&apos;re subscribed.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <label htmlFor={`${id}-email`} className={FIELD_LABEL_CLASS}>
        Your email
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={`${id}-email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
          required
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${FIELD_CLASS} flex-[1_1_180px] min-w-0`}
        />
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("dark", "paper", "shrink-0")}
        >
          {pending ? "Sending" : "Subscribe"}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="type-small text-red" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
