import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { href: "/portal",         label: "Dashboard" },
  { href: "/portal/profile", label: "Profile" },
  { href: "/portal/assets",  label: "Assets" },
  { href: "/portal/videos",  label: "Videos" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Resolve stage name: profile → artist
  let displayName = user?.email ?? "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("artist_id")
      .eq("id", user.id)
      .single();

    if (profile?.artist_id) {
      const { data: artist } = await supabase
        .from("artists")
        .select("stage_name")
        .eq("id", profile.artist_id)
        .single();
      if (artist?.stage_name) displayName = artist.stage_name;
    }
  }

  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-bone/10 flex items-center justify-between px-6 shrink-0">
        <Link href="/portal">
          <Image
            src="/logo.png"
            alt="One Flame Records"
            width={36}
            height={36}
            className="h-9 w-auto"
          />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-bone/50">{displayName}</span>
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
