import type { ReactNode } from "react";
import PosterHeadline from "@/components/PosterHeadline";

/** Public page opening in the homepage's yellow poster treatment. */
export default function PublicPageIntro({ title, children, action }: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="bg-yellow text-black border-b-4 border-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <PosterHeadline as="h1" size="poster">{title}</PosterHeadline>
            {children && <div className="mt-6 max-w-[60ch] type-lead">{children}</div>}
          </div>
          {action && <div className="min-w-0 type-label">{action}</div>}
        </div>
      </div>
    </section>
  );
}
