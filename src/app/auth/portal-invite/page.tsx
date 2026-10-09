"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import "@/app/studio.css";

function PortalInviteInner() {
  const params = useSearchParams();
  const destination = params.get("to");

  if (!destination) {
    return (
      <p className="text-[15px] text-muted text-center">
        This link is invalid. Contact the label for a new one.
      </p>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div>
        <h1 className="studio-page-title mb-3">
          One Flame Records
        </h1>
        <p className="text-[15px] text-muted">
          You&apos;ve been approved as an artist on the label.
        </p>
      </div>

      <a
        href={destination}
        className="studio-btn studio-btn-primary px-8"
      >
        Set Password &amp; Enter Portal
      </a>

      <p className="studio-hint">
        This link is single-use and expires in 24 hours.
      </p>
    </div>
  );
}

export default function PortalInvitePage() {
  return (
    <div className="studio-shell min-h-screen bg-black text-paper font-text flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Suspense fallback={<p className="text-[15px] text-muted text-center">Loading…</p>}>
          <PortalInviteInner />
        </Suspense>
      </div>
    </div>
  );
}
