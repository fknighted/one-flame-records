import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 text-center">
      {/* Flame glyph */}
      <svg
        viewBox="0 0 20 28"
        className="w-12 h-auto mb-8 opacity-40"
        aria-hidden="true"
      >
        <path
          d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z"
          fill="#8B2A1F"
        />
      </svg>

      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-4">
        404
      </p>
      <h1 className="font-display font-bold text-bone text-[clamp(2rem,5vw,3.5rem)] leading-tight mb-4">
        Page not found.
      </h1>
      <div className="h-px w-16 bg-oxblood mb-6" />
      <p className="text-bone/50 text-sm max-w-sm leading-relaxed mb-10">
        That page doesn&apos;t exist or has been moved. Head back to the
        homepage to keep listening.
      </p>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-block rounded bg-ochre px-6 py-2.5 text-sm font-semibold text-ink hover:bg-bone transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/releases"
          className="inline-block rounded border border-bone/20 px-6 py-2.5 text-sm font-semibold text-bone hover:border-bone hover:bg-bone/5 transition-colors"
        >
          Releases
        </Link>
      </div>
    </div>
  );
}
