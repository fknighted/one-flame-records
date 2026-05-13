"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/artists",  label: "Artists" },
  { href: "/releases", label: "Releases" },
  { href: "/videos",   label: "Videos" },
  { href: "/about",    label: "About" },
  { href: "/contact",  label: "Contact" },
];

function FlameMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z"
        fill="#8B2A1F"
      />
      <path
        d="M10 14C10 14 7.5 17.5 7.5 19.5C7.5 21.4 8.6 23 10 24C11.4 23 12.5 21.4 12.5 19.5C12.5 17.5 10 14 10 14Z"
        fill="#3F5A3A"
      />
    </svg>
  );
}

export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-oxblood/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setOpen(false)}
        >
          <FlameMark className="h-7 w-auto" />
          <span className="font-display font-bold text-oxblood text-lg tracking-tight leading-none">
            One Flame Records
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-ink/80 hover:text-oxblood transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 -mr-2 text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <nav
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-16 z-30 bg-cream flex flex-col px-8 pt-10 gap-1"
          aria-label="Mobile"
        >
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display text-4xl font-bold text-oxblood py-2 border-b border-oxblood/10 last:border-0"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
