import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = createServiceClient();



  const [
    { count: artistCount },
    { count: releaseCount },
    { count: videoCount },
    { count: pendingApps },
    { data: pendingApplications },
  ] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("releases").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase.from("signup_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("signup_applications")
      .select("id, stage_name, email, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Active Artists", value: artistCount ?? 0, href: "/admin/artists" },
    { label: "Releases", value: releaseCount ?? 0, href: "/admin/releases" },
    { label: "Videos", value: videoCount ?? 0, href: "/admin/videos" },
    { label: "Pending Apps", value: pendingApps ?? 0, href: "/admin/applications" },
  ];

  const quickActions = [
    { label: "+ Artist", href: "/admin/artists/new" },
    { label: "+ Release", href: "/admin/releases/new" },
    { label: "+ Video", href: "/admin/videos/new" },
    { label: "+ News post", href: "/admin/news/new" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-2">
          Label Admin
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">Overview</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-lg border border-bone/10 p-4 hover:border-bone/20 hover:bg-bone/[0.03] transition-colors group"
          >
            <p className="text-xs text-bone/60 uppercase tracking-wider mb-1">{label}</p>
            <p className="font-display text-2xl text-bone group-hover:text-ochre transition-colors">{value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs text-bone/60 uppercase tracking-wider mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-block rounded border border-bone/15 px-3.5 py-1.5 text-sm text-bone/70 hover:border-ochre/50 hover:text-ochre hover:bg-ochre/5 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Pending applications */}
      <div className="grid grid-cols-1 gap-6">

        {/* Pending applications */}
        <div className="rounded-lg border border-bone/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bone/10 bg-bone/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-wider text-bone/50">Pending Applications</p>
            <Link href="/admin/applications" className="text-xs text-bone/50 hover:text-ochre transition-colors">Review →</Link>
          </div>
          {(pendingApplications?.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-sm text-bone/50 text-center">All clear — no pending applications.</p>
          ) : (
            <ul className="divide-y divide-bone/5">
              {(pendingApplications ?? []).map((app) => (
                <li key={app.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-bone truncate">{app.stage_name}</p>
                    <p className="text-xs text-bone/60 truncate">{app.email}</p>
                  </div>
                  <Link href={`/admin/applications/${app.id}`} className="shrink-0 text-xs text-ochre hover:text-ochre/70 transition-colors">
                    Review →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
