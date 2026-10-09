"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inviteGamer } from "./actions";

export default function InviteGamerPage() {
  const [state, formAction, pending] = useActionState(inviteGamer, null);

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <p className="text-[14px] mb-2">
          <Link href="/bar/members" className="studio-link inline-flex min-h-[44px] items-center">← Members</Link>
        </p>
        <h1 className="studio-page-title">Invite Gamer</h1>
        <p className="text-[15px] text-muted mt-2">
          They&apos;ll receive an email to set their password and access the gamer portal.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {state?.error && (
          <p role="alert" className="studio-error">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="display_name" className="studio-field-label">
            Display Name <span>*</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            autoFocus
            placeholder="e.g. Jay King"
            className="studio-field"
          />
        </div>

        <div>
          <label htmlFor="email" className="studio-field-label">
            Email <span>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="gamer@email.com"
            className="studio-field"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary w-full"
        >
          {pending ? "Sending invite…" : "Send Invite"}
        </button>
      </form>
    </div>
  );
}
