"use client";

import { useActionState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { FIELD_CLASS, FIELD_LABEL_CLASS } from "@/lib/sound-system";
import { gamerSignup } from "./actions";

const TEXT_LINK = "text-red underline underline-offset-4 focus-on-paper";

export default function GamerSignupPage() {
  const [state, formAction, pending] = useActionState(gamerSignup, null);

  if (state && "success" in state) {
    return (
      <div className="bg-black px-4 sm:px-6 py-14 sm:py-[88px]">
        <div className="mx-auto max-w-md bg-paper text-black border-2 border-black p-6 sm:p-8 grid gap-4">
          <h1 className="type-headline [overflow-wrap:anywhere]">Check your email</h1>
          <span aria-hidden="true" className="section-bar" />
          <p className="type-body">
            We sent you a link to set your password and activate your Flames Lounge gamer account.
          </p>
          <Link href="/flames-lounge" className={`${TEXT_LINK} type-label min-h-[44px] inline-flex items-center`}>
            Back to Flames Lounge
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black px-4 sm:px-6 py-14 sm:py-[88px]">
      <div className="mx-auto max-w-md bg-paper text-black p-6 sm:p-8 grid gap-6">
        <div className="min-w-0">
          <Link href="/flames-lounge" className={`${TEXT_LINK} type-label min-h-[44px] inline-flex items-center`}>
            Flames Lounge
          </Link>
          <h1 className="type-headline mt-2 [overflow-wrap:anywhere]">Join as a Gamer</h1>
          <span aria-hidden="true" className="section-bar mt-2" />
          <p className="type-body-sm mt-4">
            Get a loyalty account, track your sessions, and manage your game time balance.
          </p>
        </div>

        <form action={formAction} className="grid gap-5">
          {/* Honeypot — hidden from humans; bots that fill it are silently dropped. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute left-[-9999px] w-px h-px opacity-0"
          />
          {state && "error" in state && (
            <p role="alert" className="bg-red text-paper type-body-sm px-4 py-3 border-2 border-black">
              {state.error}
            </p>
          )}

          <div>
            <label htmlFor="display_name" className={FIELD_LABEL_CLASS}>
              Your Name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="e.g. Jay King"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label htmlFor="email" className={FIELD_LABEL_CLASS}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              className={FIELD_CLASS}
            />
          </div>

          <Button type="submit" variant="dark" ground="paper" disabled={pending} className="w-full">
            {pending ? "Creating account…" : "Create Gamer Account"}
          </Button>
        </form>

        <p className="type-small">
          Already have an account?{" "}
          <Link href="/login" className={TEXT_LINK}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
