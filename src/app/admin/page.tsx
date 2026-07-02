import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

const ACTIVE_STATUSES = ["pending", "analyzing", "prompting", "generating", "assembling"];

const STATUS_PILL: Record<string, string> = {
  pending:    "bg-bone/10 text-bone/50",
  analyzing:  "bg-forest/20 text-sage",
  prompting:  "bg-forest/20 text-sage",
  generating: "bg-forest/20 text-sage",
  assembling: "bg-ochre/20 text-ochre",
  complete:   "bg-forest/30 text-sage",
  failed:     "bg-oxblood/20 text-rose",
};

function elapsed(startIso: string | null): string {
  if (!startIso) return "—";
  const s = Math.round((Date.now() - new Date(startIso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export default async function AdminOverviewPage() {
  const supabase = createServiceClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { count: artistCount },
    { count: releaseCount },
    { count: videoCount },
    { count: pendingApps },
    { data: activeJobs },
    { data: pendingApplications },
    { data: budgetRow },
    { data: monthJobs },
  ] = await Promise.all([
    supabase.from("artists").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("releases").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase.from("signup_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("video_jobs")
      .select("id, status, started_at, artists(stage_name), assets(title)")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("signup_applications")
      .select("id, stage_name, email, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("settings").select("value").eq("key", "monthly_video_budget_usd").single(),
    supabase
      .from("video_jobs")
      .select("cost_estimate_usd")
      .eq("status", "complete")
      .gte("created_at", monthStart.toISOString()),
  ]);

  const budget = parseFloat((budgetRow as { value: string } | null)?.value ?? "100");
  const spent = (monthJobs ?? []).reduce((s, j) => s + (Number(j.cost_estimate_usd) || 0), 0);
  const spentPct = Math.min(100, Math.round((spent / budget) * 100));
  const spendColor = spentPct >= 90 ? "bg-oxblood" : spentPct >= 70 ? "bg-ochre" : "bg-forest";

  const stats = [
    { label: "Active Artists", value: artistCount ?? 0, href: "/admin/artists" },
    { label: "Releases", value: releaseCount ?? 0, href: "/admin/releases" },
    { label: "Videos", value: videoCount ?? 0, href: "/admin/videos" },
    { label: "Active Jobs", value: activeJobs?.length ?? 0, href: "/admin/jobs" },
    { label: "Pending Apps", value: pendingApps ?? 0, href: "/admin/applications" },
  ];

  const quickActions = [
    { label: "+ Artist", href: "/admin/artists/new" },
    { label: "+ Release", href: "/admin/releases/new" },
    { label: "+ Video", href: "/admin/videos/new" },
    { label: "+ News post", href: "/admin/news/new" },
    { label: "Generate image", href: "/admin/ai-studio/images" },
    { label: "Generate copy", href: "/admin/ai-studio/copy" },
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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

      {/* Monthly spend bar */}
      <div className="rounded-lg border border-bone/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-bone/60 uppercase tracking-wider">Monthly video spend</p>
          <Link href="/admin/settings" className="text-xs text-bone/50 hover:text-ochre transition-colors">
            Manage budget →
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 rounded-full bg-bone/10 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${spendColor}`} style={{ width: `${spentPct}%` }} />
          </div>
          <span className="text-sm text-bone/60 font-mono shrink-0">
            ${spent.toFixed(2)} / ${budget.toFixed(0)}
          </span>
        </div>
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

      {/* Two-column: Active jobs + Pending applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Active jobs */}
        <div className="rounded-lg border border-bone/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bone/10 bg-bone/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-wider text-bone/50">
              Active Jobs
              {(activeJobs?.length ?? 0) > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-sage">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse inline-block" />
                  Live
                </span>
              )}
            </p>
            <Link href="/admin/jobs" className="text-xs text-bone/50 hover:text-ochre transition-colors">View all →</Link>
          </div>
          {(activeJobs?.length ?? 0) === 0 ? (
            <p className="px-4 py-6 text-sm text-bone/50 text-center">No active jobs.</p>
          ) : (
            <ul className="divide-y divide-bone/5">
              {(activeJobs ?? []).map((job) => {
                const artist = Array.isArray(job.artists) ? job.artists[0] : job.artists;
                const asset = Array.isArray(job.assets) ? job.assets[0] : job.assets;
                return (
                  <li key={job.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-bone truncate">{artist?.stage_name ?? "—"}</p>
                      <p className="text-xs text-bone/60 truncate">{asset?.title ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_PILL[job.status] ?? "bg-bone/10 text-bone/60"}`}>
                        {job.status}
                      </span>
                      <span className="text-xs text-bone/50 font-mono">{elapsed(job.started_at)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

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
