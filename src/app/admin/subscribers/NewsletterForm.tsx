"use client";

import { useActionState } from "react";
import { sendNewsletter, type NewsletterState } from "./actions";

const INPUT = "studio-field";
const LABEL = "studio-field-label";

export default function NewsletterForm({ activeCount }: { activeCount: number }) {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(sendNewsletter, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p role="alert" className="studio-error">{state.error}</p>
      )}
      {state?.sent != null && !state.error && (
        <p className="studio-success">
          Sent to {state.sent} subscriber{state.sent !== 1 ? "s" : ""}.
        </p>
      )}

      <div>
        <label htmlFor="newsletter-subject" className={LABEL}>Subject *</label>
        <input id="newsletter-subject" name="subject" type="text" required placeholder="One Flame Records — New Release" className={INPUT} />
      </div>

      <div>
        <label htmlFor="newsletter-body" className={LABEL}>Body (Markdown) *</label>
        <textarea
          id="newsletter-body"
          name="body"
          required
          rows={10}
          placeholder="Write your newsletter in Markdown…"
          className={`${INPUT} leading-relaxed`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || activeCount === 0}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Sending…" : `Send to ${activeCount} subscriber${activeCount !== 1 ? "s" : ""}`}
        </button>
        {activeCount === 0 && (
          <p className="studio-hint">No active subscribers yet.</p>
        )}
      </div>
    </form>
  );
}
