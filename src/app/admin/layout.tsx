import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { href: "/admin",              label: "Overview" },
  { href: "/admin/artists",      label: "Artists" },
  { href: "/admin/releases",     label: "Releases" },
  { href: "/admin/videos",       label: "Videos" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/codes",        label: "Codes" },
  { href: "/admin/jobs",         label: "Jobs" },
  { href: "/admin/settings",     label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      {/* Top bar */}
      <header className="h-20 border-b border-bone/10 flex items-center justify-between px-6 shrink-0">
        <Link href="/admin">
          <Image
            src="/logo-4.png"
            alt="One Flame Records"
            width={140}
            height={77}
            className="h-14 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-bone/50">{user?.email}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-52 border-r border-bone/10 py-6 px-3 shrink-0">
          <ul className="space-y-1">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded px-3 py-2 text-sm text-bone/70 hover:bg-bone/5 hover:text-bone transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
