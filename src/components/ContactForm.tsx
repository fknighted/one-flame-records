"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/(public)/contact/actions";

export default function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    submitContact,
    null
  );

  if (state?.status === "success") {
    return (
      <div className="py-12 text-center">
        <h2 className="font-display font-bold text-oxblood text-3xl mb-4">
          Message received.
        </h2>
        <p className="text-ink/70 leading-relaxed">
          Thanks for reaching out. We read every message and get back to the
          ones that are a good fit — usually within a few days.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {/* Honeypot — hidden from real users, bots fill it */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">
          Name <span className="text-oxblood">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded border border-ink/20 bg-bone px-3 py-2.5 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
          Email <span className="text-oxblood">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded border border-ink/20 bg-bone px-3 py-2.5 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-ink mb-1.5">
          Reason
        </label>
        <select
          id="reason"
          name="reason"
          defaultValue="general"
          className="w-full rounded border border-ink/20 bg-bone px-3 py-2.5 text-sm text-ink focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
        >
          <option value="general">General enquiry</option>
          <option value="press">Press &amp; media</option>
          <option value="sync">Sync licensing</option>
          <option value="artist_submission">Artist submission</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">
          Message <span className="text-oxblood">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full rounded border border-ink/20 bg-bone px-3 py-2.5 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood resize-none"
          placeholder="Tell us what's on your mind."
        />
      </div>

      {state?.status === "error" && (
        <p className="text-sm text-oxblood">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-oxblood px-6 py-3 text-sm font-semibold text-bone hover:bg-ochre disabled:opacity-50 transition-colors"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
