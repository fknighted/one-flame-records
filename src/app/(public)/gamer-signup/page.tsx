"use client";

import { useActionState } from "react";
import Link from "next/link";
import { gamerSignup } from "./actions";

export default function GamerSignupPage() {
  const [state, formAction, pending] = useActionState(gamerSignup, null);

  if (state && "success" in state) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🎮</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-ink text-2xl mb-2">Check your email</h1>
            <p className="text-ink/60 text-sm">
              We sent you a link to set your password and activate your Flames Lounge gamer account.
            </p>
          </div>
          <Link href="/flames-lounge" className="text-sm text-oxblood hover:underline">
            ← Back to Flames Lounge
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div>
          <Link href="/flames-lounge" className="text-sm text-ink/40 hover:text-ink/70 transition-colors">
            ← Flames Lounge
          </Link>
          <h1 className="font-display font-bold text-ink text-3xl mt-4 mb-1">Join as a Gamer</h1>
          <p className="text-ink/50 text-sm">
            Get a loyalty account, track your sessions, and manage your game time balance.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {state && "error" in state && (
            <p className="text-sm text-oxblood bg-oxblood/10 border border-oxblood/20 rounded-lg px-4 py-3">
              {state.error}
            </p>
          )}

          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-ink/70 mb-1.5">
              Your Name
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              autoFocus
              placeholder="e.g. Jay King"
              className="w-full bg-white border border-ink/15 rounded-xl px-4 py-3 text-ink placeholder:text-ink/25 text-base focus:outline-none focus:border-oxblood/50 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink/70 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@email.com"
              className="w-full bg-white border border-ink/15 rounded-xl px-4 py-3 text-ink placeholder:text-ink/25 text-base focus:outline-none focus:border-oxblood/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-oxblood text-cream font-semibold text-base py-3.5 rounded-xl hover:bg-oxblood/90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {pending ? "Creating account…" : "Create Gamer Account"}
          </button>
        </form>

        <p className="text-center text-xs text-ink/30">
          Already have an account?{" "}
          <Link href="/login" className="text-oxblood hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
