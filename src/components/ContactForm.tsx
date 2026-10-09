"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/(public)/contact/actions";
import { FIELD_CLASS, FIELD_LABEL_CLASS, buttonClasses } from "@/lib/sound-system";

export default function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    submitContact,
    null
  );

  if (state?.status === "success") {
    return (
      <div className="bg-paper text-black p-5 sm:p-6" role="status">
        <h2 className="type-title mb-3">
          Message received.
        </h2>
        <p className="type-body">
          Thanks for reaching out. We read every message and get back to the
          ones that are a good fit — usually within a few days.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="bg-paper text-black p-5 sm:p-6 space-y-5">
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
        <label htmlFor="name" className={FIELD_LABEL_CLASS}>
          Name <span className="text-red" aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={FIELD_CLASS}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className={FIELD_LABEL_CLASS}>
          Email <span className="text-red" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD_CLASS}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="reason" className={FIELD_LABEL_CLASS}>
          Reason
        </label>
        <select
          id="reason"
          name="reason"
          defaultValue="general"
          className={FIELD_CLASS}
        >
          <option value="general">General enquiry</option>
          <option value="press">Press &amp; media</option>
          <option value="sync">Sync licensing</option>
          <option value="artist_submission">Artist submission</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className={FIELD_LABEL_CLASS}>
          Message <span className="text-red" aria-hidden="true">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={`${FIELD_CLASS} py-2.5 resize-none`}
          placeholder="Tell us what's on your mind."
        />
      </div>

      {state?.status === "error" && (
        <p className="type-small text-red" role="alert">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses("dark", "paper", "w-full")}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
