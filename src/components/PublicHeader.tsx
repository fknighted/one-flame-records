"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV = [
  { href: "/artists",  label: "Artists" },
  { href: "/releases", label: "Releases" },
  { href: "/videos",   label: "Videos" },
  { href: "/news",     label: "News" },
  { href: "/about",    label: "About" },
  { href: "/contact",  label: "Contact" },
];

const NAV_CTA = { href: "/sign", label: "Sign with us" };

export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-oxblood/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between h-24">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo-2.png"
            alt="One Flame Records"
            width={160}
            height={88}
            className="h-20 w-auto"
            priority
          />
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
          <Link
            href={NAV_CTA.href}
            className="text-sm font-semibold text-oxblood border border-oxblood/40 rounded px-3.5 py-1.5 hover:bg-oxblood hover:text-bone transition-colors"
          >
            {NAV_CTA.label}
          </Link>
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

      {/* Mobile overlay — z-[60] sits above grain overlay (z-50) and header (z-40) */}
      {open && (
        <nav
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-24 z-[60] flex flex-col px-8 pt-6 gap-0"
          style={{ backgroundColor: "#1A1612" }}
          aria-label="Mobile"
        >
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display text-xl font-bold text-bone py-3 border-b border-bone/10 hover:text-ochre transition-colors"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href={NAV_CTA.href}
            className="font-display text-xl font-bold text-ochre py-3 border-b border-bone/10 last:border-0 hover:text-bone transition-colors"
            onClick={() => setOpen(false)}
          >
            {NAV_CTA.label}
          </Link>
        </nav>
      )}
    </header>
  );
}
