"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import LogoMark from "@/components/LogoMark";

interface Props {
  displayName: string;
  pendingApps?: number;
  isBartender?: boolean;
  children: React.ReactNode;
  mode?: "admin" | "portal" | "bar";
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
    label: "Community",
    items: [
      { href: "/admin/events",      label: "Events" },
      { href: "/admin/subscribers", label: "Subscribers" },
    ],
  },
  {
    label: "Bar",
    items: [
      { href: "/admin/bar",           label: "Overview" },
      { href: "/admin/bar/sales",     label: "Sales" },
      { href: "/admin/bar/inventory", label: "Inventory" },
      { href: "/admin/bar/tabs",    label: "Order History" },
      { href: "/admin/bar/staff",   label: "Bar Staff" },
      { href: "/bar",               label: "Bar POS →" },
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

const BAR_NAV: NavGroup[] = [
  {
    label: "Bar",
    items: [
      { href: "/bar",          label: "Tabs" },
      { href: "/bar/regulars", label: "Regulars" },
    ],
  },
  {
    label: "Gaming",
    items: [
      { href: "/bar/sessions", label: "Sessions" },
    ],
  },
  {
    items: [{ href: "/bar/inventory", label: "Inventory" }],
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

function NavLinks({
  groups,
  pathname,
  onClose,
}: {
  groups: NavGroup[];
  pathname: string;
  onClose?: () => void;
}) {
  function isActive(href: string) {
    const depth = href.split("/").filter(Boolean).length;
    if (depth <= 1) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="space-y-5">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="studio-label px-3 mb-1.5">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, badge }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={[
                    "studio-focus flex min-h-[44px] items-center justify-between border-l-[3px] px-3 py-2 text-[15px] transition-colors",
                    isActive(href)
                      ? "border-paper bg-raised font-semibold text-paper"
                      : "border-transparent text-muted hover:bg-raised hover:text-paper",
                  ].join(" ")}
                >
                  <span>{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="studio-chip studio-chip-count ml-2 shrink-0">
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
}

export default function InkShell({ displayName, pendingApps, isBartender, children, mode = "admin" }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const baseGroups =
    mode === "admin" ? ADMIN_NAV :
    mode === "bar"   ? BAR_NAV   :
    PORTAL_NAV;

  const groups: NavGroup[] =
    mode === "portal" && isBartender
      ? [...baseGroups, { items: [{ href: "/bar", label: "Bar POS →" }] }]
      : baseGroups;

  const homeHref =
    mode === "admin" ? "/" :
    mode === "bar"   ? "/bar" :
    "/portal";

  // Inject pendingApps badge into Applications item
  const resolvedGroups: NavGroup[] = groups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.href === "/admin/applications" && pendingApps
        ? { ...item, badge: pendingApps }
        : item
    ),
  }));

  return (
    <div className="studio-shell min-h-screen bg-black text-paper font-text flex flex-col">
      {/* Top bar */}
      <header className="h-16 border-b border-line bg-black flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0">
        <button
          className="studio-focus sm:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 text-paper transition-colors hover:bg-raised"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        <Link href={homeHref} className="studio-focus shrink-0">
          <LogoMark variant="horizontal" ground="black" height={40} priority />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="hidden sm:block text-sm text-muted truncate max-w-[24ch]">{displayName}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile backdrop */}
        {open && (
          <div className="sm:hidden fixed inset-0 z-40 bg-black/80" onClick={() => setOpen(false)} />
        )}

        {/* Sidebar */}
        <nav
          className={[
            "fixed sm:static inset-y-0 left-0 z-50",
            "w-64 sm:w-56 shrink-0",
            "bg-panel border-r border-line",
            "flex flex-col py-6 px-3 overflow-y-auto",
            "transform transition-transform duration-200 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
          ].join(" ")}
        >
          {/* Desktop logo */}
          <div className="hidden sm:flex justify-center px-4 mb-8">
            <Link href={homeHref} className="studio-focus">
              <LogoMark variant="flame" ground="black" height={56} />
            </Link>
          </div>

          {/* Mobile header inside sidebar */}
          <div className="sm:hidden flex items-center justify-between px-3 mb-6">
            <Link href={homeHref} onClick={() => setOpen(false)} className="studio-focus">
              <LogoMark variant="horizontal" ground="black" height={36} />
            </Link>
            <button onClick={() => setOpen(false)} className="studio-focus inline-flex items-center justify-center w-11 h-11 -mr-2 text-paper transition-colors hover:bg-raised" aria-label="Close navigation">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                <path d="M15 5L5 15M5 5l10 10" />
              </svg>
            </button>
          </div>

          {/* Display name — mobile */}
          <div className="sm:hidden px-3 mb-4 pb-4 border-b border-line">
            <p className="text-sm text-muted truncate">{displayName}</p>
          </div>

          <NavLinks groups={resolvedGroups} pathname={pathname} onClose={() => setOpen(false)} />
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
