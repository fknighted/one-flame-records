"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inviteGamer } from "./actions";

export default function InviteGamerPage() {
  const [state, formAction, pending] = useActionState(inviteGamer, null);

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <p className="text-xs text-bone/40 mb-1">
          <Link href="/bar/members" className="hover:text-bone transition-colors">← Members</Link>
        </p>
        <h1 className="font-display font-bold text-bone text-2xl">Invite Gamer</h1>
        <p className="text-sm text-bone/50 mt-1">
          They&apos;ll receive an email to set their password and access the gamer portal.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="display_name" className="block text-sm font-medium text-bone/70 mb-1.5">
            Display Name <span className="text-oxblood">*</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            autoFocus
            placeholder="e.g. Jay King"
            className="w-full bg-bone/5 border border-bone/15 rounded-lg px-4 py-3 text-bone placeholder:text-bone/25 text-base focus:outline-none focus:border-ochre/50 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-bone/70 mb-1.5">
            Email <span className="text-oxblood">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="gamer@email.com"
            className="w-full bg-bone/5 border border-bone/15 rounded-lg px-4 py-3 text-bone placeholder:text-bone/25 text-base focus:outline-none focus:border-ochre/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ochre text-ink font-semibold text-base py-3.5 rounded-lg hover:bg-ochre/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {pending ? "Sending invite…" : "Send Invite"}
        </button>
      </form>
    </div>
  );
}
