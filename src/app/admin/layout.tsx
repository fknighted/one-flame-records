import { createClient } from "@/lib/supabase/server";
import InkShell from "@/components/InkShell";

const NAV = [
  { href: "/admin",              label: "Overview" },
  { href: "/admin/artists",      label: "Artists" },
  { href: "/admin/releases",     label: "Releases" },
  { href: "/admin/videos",       label: "Videos" },
  { href: "/admin/news",         label: "News" },
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
    <InkShell nav={NAV} displayName={user?.email ?? ""}>
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </InkShell>
  );
}
