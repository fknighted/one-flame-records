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
        <p className="studio-label mb-2">Label Admin</p>
        <h1 className="studio-page-title">Overview</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="studio-stat hover:bg-raised focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-yellow"
          >
            <p className="studio-stat-label">{label}</p>
            <p className="studio-stat-value">{value}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="studio-label mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="studio-btn studio-btn-secondary studio-btn-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Pending applications */}
      <div className="grid grid-cols-1 gap-6">

        {/* Pending applications */}
        <div className="studio-card p-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
            <h2 className="studio-section-title">Pending Applications</h2>
            <Link href="/admin/applications" className="studio-link inline-flex min-h-[44px] items-center text-[15px]">Review</Link>
          </div>
          {(pendingApplications?.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-[15px] text-muted text-center">All clear — no pending applications.</p>
          ) : (
            <ul className="divide-y divide-line">
              {(pendingApplications ?? []).map((app) => (
                <li key={app.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-paper truncate">{app.stage_name}</p>
                    <p className="text-[15px] text-muted truncate">{app.email}</p>
                  </div>
                  <Link href={`/admin/applications/${app.id}`} className="studio-btn studio-btn-secondary studio-btn-sm shrink-0">
                    Review
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
