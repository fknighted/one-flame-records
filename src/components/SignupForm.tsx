"use client";

import { useActionState } from "react";
import { submitApplication, type SignupState } from "@/app/(public)/signup/[code]/actions";

import { FIELD_CLASS, FIELD_LABEL_CLASS, buttonClasses } from "@/lib/sound-system";

// Every field sits on paper: 2px black edge, red focus ring.
const inputClass = FIELD_CLASS;
const labelClass = FIELD_LABEL_CLASS;
const headingClass = "type-title-sm mb-4";

export default function SignupForm({ codeId }: { codeId: string }) {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    submitApplication,
    null
  );

  if (state?.status === "success") {
    return (
      <div className="bg-paper text-black p-5 sm:p-6" role="status">
        <h2 className="type-title mb-3">
          Application received
        </h2>
        <p className="type-body">
          We&apos;ll review your application and reach out to{" "}
          <span className="font-semibold">you by email</span>.
          Keep making music — we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="bg-paper text-black p-5 sm:p-6 space-y-8">
      {/* Honeypot */}
      <input name="website" type="text" className="sr-only" tabIndex={-1} autoComplete="off" />
      <input name="code_id" type="hidden" value={codeId} />

      {/* Personal info */}
      <div>
        <h2 className={headingClass}>
          About you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="signup-stage_name" className={labelClass}>
              Stage name <span className="text-red" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-stage_name"
              name="stage_name"
              type="text"
              required
              placeholder="Your artist name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="signup-legal_name" className={labelClass}>
              Legal name <span className="text-red" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-legal_name"
              name="legal_name"
              type="text"
              required
              placeholder="First and last name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="signup-email" className={labelClass}>
              Email <span className="text-red" aria-hidden="true">*</span>
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="signup-phone" className={labelClass}>Phone</label>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              placeholder="+1 876 000 0000"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Sound */}
      <div>
        <h2 className={headingClass}>
          Your sound
        </h2>
        <div>
          <label htmlFor="signup-genres" className={labelClass}>Genres</label>
          <input
            id="signup-genres"
            name="genres"
            aria-describedby="genres-hint"
            type="text"
            placeholder="e.g. reggae, dancehall, roots"
            className={inputClass}
          />
          <p id="genres-hint" className="mt-1 type-small text-black/75">Separate multiple genres with commas.</p>
        </div>
      </div>

      {/* Socials */}
      <div>
        <h2 className={headingClass}>
          Socials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "socials_instagram", label: "Instagram", placeholder: "@handle" },
            { name: "socials_tiktok",    label: "TikTok",    placeholder: "@handle" },
            { name: "socials_twitter",   label: "X / Twitter", placeholder: "@handle" },
            { name: "socials_youtube",   label: "YouTube",   placeholder: "Channel URL or handle" },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label htmlFor={`signup-${name}`} className={labelClass}>{label}</label>
              <input
                id={`signup-${name}`}
                name={name}
                type="text"
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="signup-message" className={labelClass}>Tell us about yourself</label>
        <textarea
          id="signup-message"
          name="message"
          rows={4}
          placeholder="Where you're from, what you've been working on, why you want to sign with One Flame…"
          className={`${inputClass} py-2.5 resize-none`}
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
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
