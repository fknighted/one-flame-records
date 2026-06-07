"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

interface Props {
  displayName: string;
  pendingApps?: number;
  children: React.ReactNode;
  /** portal mode — different home href and no AI Studio */
  mode?: "admin" | "portal";
}

type NavItem = { href: string; label: string; badge?: number };
type NavGroup = { label?: string; items: NavItem[] };

const ADMIN_NAV: NavGroup[] = [
  {
    items: [{ href: "/admin", label: "Overview" }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/artists", label: "Artists" },
      { href: "/admin/releases", label: "Releases" },
      { href: "/admin/videos", label: "Videos" },
      { href: "/admin/news", label: "News" },
    ],
  },
  {
    label: "AI Studio",
    items: [
      { href: "/admin/ai-studio/images", label: "Images" },
      { href: "/admin/ai-studio/copy", label: "Copy" },
      { href: "/admin/campaigns", label: "Campaigns" },
      { href: "/admin/campaigns/ideas", label: "Ideas" },
      { href: "/admin/jobs", label: "Video Jobs" },
    ],
  },
  {
    label: "Onboarding",
    items: [
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/codes", label: "Codes" },
    ],
  },
  {
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];

const PORTAL_NAV: NavGroup[] = [
  {
    items: [
      { href: "/portal", label: "Dashboard" },
      { href: "/portal/releases", label: "Releases" },
      { href: "/portal/assets", label: "Assets" },
      { href: "/portal/videos", label: "Videos" },
      { href: "/portal/profile", label: "Profile" },
    ],
  },
];

export default function InkShell({ displayName, pendingApps, children, mode = "admin" }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const groups = mode === "admin" ? ADMIN_NAV : PORTAL_NAV;
  const homeHref = mode === "admin" ? "/" : "/portal";

  // Inject pendingApps badge into Applications item
  const resolvedGroups: NavGroup[] = groups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === "/admin/applications" && pendingApps
        ? { ...item, badge: pendingApps }
        : item
    ),
  }));

  function isActive(href: string) {
    // /admin exact match, /admin/ai-studio/* prefix, etc.
    const depth = href.split("/").filter(Boolean).length;
    if (depth <= 1) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-5">
      {resolvedGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-bone/25">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className={[
                    "flex items-center justify-between rounded px-3 py-2 text-sm transition-colors",
                    isActive(href)
                      ? "bg-bone/10 text-bone"
                      : "text-bone/60 hover:bg-bone/5 hover:text-bone",
                  ].join(" ")}
                >
                  <span>{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center rounded-full bg-oxblood text-bone text-[10px] font-semibold w-4 h-4 shrink-0">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      {/* Top bar */}
      <header className="h-16 sm:h-20 border-b border-bone/10 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <button
          className="sm:hidden p-2 -ml-2 text-bone/60 hover:text-bone transition-colors"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        <Link href={homeHref}>
          <Image src="/logo-4.png" alt="One Flame Records" width={200} height={110} className="h-14 sm:h-20 w-auto" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden sm:block text-sm text-bone/50">{displayName}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {open && (
          <div className="sm:hidden fixed inset-0 z-40 bg-ink/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
        )}

        {/* Sidebar */}
        <nav
          className={[
            "fixed sm:static inset-y-0 left-0 z-50",
            "w-64 sm:w-56 shrink-0",
            "bg-ink border-r border-bone/10",
            "flex flex-col py-6 px-3 overflow-y-auto",
            "transform transition-transform duration-200 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
          ].join(" ")}
        >
          {/* Desktop logo */}
          <div className="hidden sm:flex justify-center px-4 mb-8">
            <Link href={homeHref}>
              <Image src="/logo.png" alt="One Flame Records" width={140} height={140} className="w-28 h-auto" />
            </Link>
          </div>

          {/* Mobile header inside sidebar */}
          <div className="sm:hidden flex items-center justify-between px-3 mb-6">
            <Link href={homeHref} onClick={() => setOpen(false)}>
              <Image src="/logo-4.png" alt="One Flame Records" width={160} height={88} className="h-12 w-auto" />
            </Link>
            <button onClick={() => setOpen(false)} className="p-1 text-bone/50 hover:text-bone transition-colors" aria-label="Close navigation">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>

          {/* Display name — mobile */}
          <div className="sm:hidden px-3 mb-4 pb-4 border-b border-bone/10">
            <p className="text-xs text-bone/40 truncate">{displayName}</p>
          </div>

          <NavLinks onClose={() => setOpen(false)} />
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
