"use client";

import { useActionState } from "react";
import { sendNewsletter, type NewsletterState } from "./actions";

const INPUT = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1.5";

export default function NewsletterForm({ activeCount }: { activeCount: number }) {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(sendNewsletter, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-2 text-sm text-oxblood">{state.error}</p>
      )}
      {state?.sent != null && !state.error && (
        <p className="rounded bg-forest/15 border border-forest/25 px-4 py-2 text-sm text-forest">
          ✓ Sent to {state.sent} subscriber{state.sent !== 1 ? "s" : ""}.
        </p>
      )}

      <div>
        <label className={LABEL}>Subject *</label>
        <input name="subject" type="text" required placeholder="One Flame Records — New Release" className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>Body (Markdown) *</label>
        <textarea
          name="body"
          required
          rows={10}
          placeholder="Write your newsletter in Markdown…"
          className={`${INPUT} font-mono text-xs leading-relaxed`}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending || activeCount === 0}
          className="rounded bg-ochre px-5 py-2.5 text-sm font-medium text-ink hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Sending…" : `Send to ${activeCount} subscriber${activeCount !== 1 ? "s" : ""}`}
        </button>
        {activeCount === 0 && (
          <p className="text-xs text-bone/40">No active subscribers yet.</p>
        )}
      </div>
    </form>
  );
}
