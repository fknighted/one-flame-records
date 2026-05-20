import { createClient } from "@/lib/supabase/server";
import InkShell from "@/components/InkShell";

const NAV = [
  { href: "/portal",          label: "Dashboard" },
  { href: "/portal/releases", label: "Releases" },
  { href: "/portal/assets",   label: "Assets" },
  { href: "/portal/videos",   label: "Videos" },
  { href: "/portal/profile",  label: "Profile" },
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
    <InkShell nav={NAV} displayName={displayName}>
      {children}
    </InkShell>
  );
}
