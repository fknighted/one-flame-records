"use client";

import Link from "next/link";
import { useState } from "react";
import LogoMark from "@/components/LogoMark";

const NAV = [
  { href: "/artists",       label: "Artists" },
  { href: "/releases",      label: "Releases" },
  { href: "/videos",        label: "Videos" },
  { href: "/news",          label: "News" },
  { href: "/flames-lounge", label: "Flames Lounge" },
  { href: "/about",         label: "About" },
  { href: "/contact",       label: "Contact" },
];

const NAV_CTA = { href: "/sign", label: "Sign with us" };

// Navigation on black: small paper text, yellow focus ring.
const LINK =
  "type-small text-paper underline-offset-4 hover:text-yellow hover:underline focus-on-black";

export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black border-b-4 border-yellow">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between gap-4 py-3">
        {/* Logo: plain light horizontal lockup on black */}
        <Link
          href="/"
          className="flex items-center shrink-0 min-h-[44px] focus-on-black"
          onClick={() => setOpen(false)}
        >
          <LogoMark variant="horizontal" ground="black" height={40} className="h-10 w-auto lg:h-12" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-x-5" aria-label="Main">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className={LINK}>
              {label}
            </Link>
          ))}
          <Link href="/search" aria-label="Search" className="text-paper hover:text-yellow focus-on-black p-1 -m-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </Link>
          <Link href={NAV_CTA.href} className="type-small text-yellow underline underline-offset-4 hover:text-paper focus-on-black">
            {NAV_CTA.label}
          </Link>
        </nav>

        {/* Phone: outlined yellow Menu button */}
        <button
          type="button"
          className="lg:hidden min-h-[46px] px-3 border-2 border-yellow text-yellow type-label hover:bg-yellow hover:text-black focus-on-black"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Phone menu: folds out under the header bar */}
      {open && (
        <nav
          id="mobile-menu"
          className="lg:hidden bg-black border-t-2 border-line px-4 sm:px-6 pt-2 pb-6 max-h-[calc(100dvh-78px)] overflow-y-auto"
          aria-label="Mobile"
        >
          {[...NAV, { href: "/search", label: "Search" }].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block py-3 border-b-2 border-line type-title-sm text-paper hover:text-yellow focus-on-black"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href={NAV_CTA.href}
            className="block py-3 type-title-sm text-yellow underline underline-offset-4 hover:text-paper focus-on-black"
            onClick={() => setOpen(false)}
          >
            {NAV_CTA.label}
          </Link>
        </nav>
      )}
    </header>
  );
}
