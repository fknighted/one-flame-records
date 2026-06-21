import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCents, jamaicaMidnight, jamaicaTime } from "@/lib/bar/pos";

const STATUS_LABELS: Record<string, string> = {
  open:   "Open",
  closed: "Closed",
  voided: "Voided",
};

export default async function BarOverviewPage() {
  const supabase = createServiceClient();

  const todayStart  = jamaicaMidnight();
  const weekStart   = jamaicaMidnight(7);
  const monthStart  = jamaicaMidnight(30);

  const [
    { data: todayAllTabs },
    { data: weekClosed },
    { data: monthClosed },
    { count: totalItems },
    { count: activeMembers },
    { count: activeSessions },
  ] = await Promise.all([
    supabase.from("pos_tabs").select("id, name, total_cents, status, created_at").gte("created_at", todayStart.toISOString()).order("created_at", { ascending: false }),
    supabase.from("pos_tabs").select("total_cents").eq("status", "closed").gte("closed_at", weekStart.toISOString()),
    supabase.from("pos_tabs").select("total_cents").eq("status", "closed").gte("closed_at", monthStart.toISOString()),
    supabase.from("pos_items").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("gamer_members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("game_sessions").select("id", { count: "exact", head: true }).is("ended_at", null),
  ]);

  const todayRevenue  = (todayAllTabs ?? []).filter(t => t.status === "closed").reduce((sum, t) => sum + (t.total_cents ?? 0), 0);
  const weekRevenue   = (weekClosed  ?? []).reduce((sum, t) => sum + (t.total_cents ?? 0), 0);
  const monthRevenue  = (monthClosed ?? []).reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Overview</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Revenue totals */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today",      value: formatCents(todayRevenue) },
          { label: "This Week",  value: formatCents(weekRevenue)  },
          { label: "This Month", value: formatCents(monthRevenue) },
        ].map((card) => (
          <div key={card.label} className="border border-bone/10 rounded-lg p-4">
            <p className="text-xs text-bone/40 mb-1">{card.label}</p>
            <p className="text-2xl font-display font-bold text-bone">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Sessions", value: activeSessions ?? 0,  href: "/bar/sessions" },
          { label: "Menu Items",      value: totalItems ?? 0,       href: "/admin/bar/inventory" },
          { label: "Gamer Members",   value: activeMembers ?? 0,    href: "/admin/bar/members" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-bone/10 rounded-lg p-4 hover:border-bone/25 transition-colors"
          >
            <p className="text-xs text-bone/40 mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-bone">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Today's tabs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35">Today&apos;s Tabs</h2>
          <Link href="/bar/tabs/new" className="text-xs text-ochre hover:underline">+ New Tab</Link>
        </div>

        {!todayAllTabs?.length ? (
          <p className="text-sm text-bone/30">No tabs opened today.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {todayAllTabs.map((tab) => (
                  <tr key={tab.id} className="hover:bg-bone/3 transition-colors">
                    <td className="px-4 py-3 text-bone font-medium">
                      {tab.status === "open" ? (
                        <Link href={`/bar/tabs/${tab.id}`} className="hover:text-ochre transition-colors">{tab.name}</Link>
                      ) : tab.name}
                    </td>
                    <td className="px-4 py-3 text-bone/50 text-xs">
                      {jamaicaTime(tab.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={[
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        tab.status === "closed" ? "bg-forest/20 text-forest" :
                        tab.status === "open"   ? "bg-ochre/20 text-ochre" :
                        "bg-bone/10 text-bone/40",
                      ].join(" ")}>
                        {STATUS_LABELS[tab.status] ?? tab.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-bone">
                      {formatCents(tab.total_cents ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="flex flex-wrap gap-3">
        <Link href="/admin/bar/sales"     className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Sales Report</Link>
        <Link href="/admin/bar/inventory" className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Inventory</Link>
        <Link href="/admin/bar/items"     className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Manage Menu</Link>
        <Link href="/admin/bar/tabs"      className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Order History</Link>
      </section>
    </div>
  );
}
