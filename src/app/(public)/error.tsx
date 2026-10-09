"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import PosterHeadline from "@/components/PosterHeadline";
import Button from "@/components/Button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="bg-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
        <div className="bg-black border-[3px] border-dashed border-yellow p-5 sm:p-8 grid gap-4 justify-items-start max-w-2xl">
          <PosterHeadline size="headline" className="text-paper">
            Something went wrong
          </PosterHeadline>
          <span aria-hidden="true" className="section-bar -mt-2" />
          <p className="type-body text-paper max-w-[66ch]">
            We hit a snag loading this page. Please try again.
          </p>
          <Button onClick={reset} variant="primary" ground="black">
            Try again
          </Button>
        </div>
      </div>
    </section>
  );
}
