"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PortalInviteInner() {
  const params = useSearchParams();
  const destination = params.get("to");

  if (!destination) {
    return (
      <p className="text-ink/50 text-sm text-center">
        This link is invalid. Contact the label for a new one.
      </p>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="font-display text-3xl text-oxblood mb-2">
          One Flame Records
        </h1>
        <p className="text-ink/60 text-sm">
          You&apos;ve been approved as an artist on the label.
        </p>
      </div>

      <a
        href={destination}
        className="inline-block rounded bg-ochre px-8 py-3 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors"
      >
        Set Password &amp; Enter Portal
      </a>

      <p className="text-xs text-ink/30">
        This link is single-use and expires in 24 hours.
      </p>
    </div>
  );
}

export default function PortalInvitePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-ink/40 text-sm text-center">Loading…</p>}>
          <PortalInviteInner />
        </Suspense>
      </div>
    </div>
  );
}
