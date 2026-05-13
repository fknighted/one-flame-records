"use client";

import { useActionState } from "react";
import { submitApplication, type SignupState } from "@/app/(public)/signup/[code]/actions";

const inputClass =
  "w-full border border-ink/20 rounded px-3 py-2 text-sm text-ink bg-cream placeholder:text-ink/40 focus:outline-none focus:border-oxblood";
const labelClass = "block text-xs font-semibold text-ink/60 uppercase tracking-wider mb-1";

export default function SignupForm({ codeId }: { codeId: string }) {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    submitApplication,
    null
  );

  if (state?.status === "success") {
    return (
      <div className="rounded-lg border border-forest/30 bg-forest/5 px-6 py-8 text-center">
        <p className="text-2xl mb-2">🔥</p>
        <h2 className="font-display font-bold text-oxblood text-xl mb-2">
          Application received
        </h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          We&apos;ll review your application and reach out to{" "}
          <span className="font-medium text-ink">you by email</span>.
          Keep making music — we&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {/* Honeypot */}
      <input name="website" type="text" className="sr-only" tabIndex={-1} autoComplete="off" />
      <input name="code_id" type="hidden" value={codeId} />

      {/* Personal info */}
      <div>
        <h2 className="font-display font-bold text-oxblood text-lg mb-4">
          About you
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Stage name <span className="text-oxblood">*</span>
            </label>
            <input
              name="stage_name"
              type="text"
              required
              placeholder="Your artist name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Legal name <span className="text-oxblood">*</span>
            </label>
            <input
              name="legal_name"
              type="text"
              required
              placeholder="First and last name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Email <span className="text-oxblood">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
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
        <h2 className="font-display font-bold text-oxblood text-lg mb-4">
          Your sound
        </h2>
        <div>
          <label className={labelClass}>Genres</label>
          <input
            name="genres"
            type="text"
            placeholder="e.g. reggae, dancehall, roots"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-ink/40">Separate multiple genres with commas.</p>
        </div>
      </div>

      {/* Socials */}
      <div>
        <h2 className="font-display font-bold text-oxblood text-lg mb-4">
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
              <label className={labelClass}>{label}</label>
              <input
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
        <label className={labelClass}>Tell us about yourself</label>
        <textarea
          name="message"
          rows={4}
          placeholder="Where you're from, what you've been working on, why you want to sign with One Flame…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {state?.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-oxblood text-cream font-semibold text-sm rounded hover:bg-oxblood/90 disabled:opacity-50 transition-colors"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
