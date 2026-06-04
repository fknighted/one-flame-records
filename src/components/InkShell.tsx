"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type NavItem = { href: string; label: string };

interface Props {
  nav: NavItem[];
  displayName: string;
  children: React.ReactNode;
}

export default function InkShell({ nav, displayName, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    const depth = href.split("/").filter(Boolean).length;
    if (depth <= 1) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      {/* Top bar */}
      <header className="h-16 sm:h-20 border-b border-bone/10 flex items-center justify-between px-4 sm:px-6 shrink-0">
        {/* Hamburger — mobile only */}
        <button
          className="sm:hidden p-2 -ml-2 text-bone/60 hover:text-bone transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        <Link href={nav[0].href}>
          <Image
            src="/logo-4.png"
            alt="One Flame Records"
            width={200}
            height={110}
            className="h-14 sm:h-20 w-auto"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:block text-sm text-bone/50">{displayName}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {open && (
          <div
            className="sm:hidden fixed inset-0 z-40 bg-ink/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav
          className={[
            "fixed sm:static inset-y-0 left-0 z-50",
            "w-64 sm:w-60 shrink-0",
            "bg-ink border-r border-bone/10",
            "py-6 px-3",
            "transform transition-transform duration-200 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
          ].join(" ")}
        >
          {/* Desktop sidebar logo */}
          <div className="hidden sm:flex justify-center px-4 mb-8">
            <Link href={nav[0].href}>
              <Image
                src="/logo.png"
                alt="One Flame Records"
                width={160}
                height={160}
                className="w-36 h-auto"
              />
            </Link>
          </div>

          {/* Mobile header inside sidebar */}
          <div className="sm:hidden flex items-center justify-between px-3 mb-6">
            <Link href={nav[0].href} onClick={() => setOpen(false)}>
              <Image
                src="/logo-4.png"
                alt="One Flame Records"
                width={160}
                height={88}
                className="h-14 w-auto"
              />
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-bone/50 hover:text-bone transition-colors"
              aria-label="Close navigation"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>

          {/* Display name — mobile only */}
          <div className="sm:hidden px-3 mb-4 pb-4 border-b border-bone/10">
            <p className="text-xs text-bone/40 truncate">{displayName}</p>
          </div>

          <ul className="space-y-1">
            {nav.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={[
                    "block rounded px-3 py-2 text-sm transition-colors",
                    isActive(href)
                      ? "bg-bone/10 text-bone"
                      : "text-bone/70 hover:bg-bone/5 hover:text-bone",
                  ].join(" ")}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
