import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCents, jamaicaMidnight, jamaicaTime, jamaicaDateTime } from "@/lib/bar/pos";

const STATUS_LABELS: Record<string, string> = {
  open:   "Open",
  away:   "Away",
  closed: "Closed",
  voided: "Voided",
};

export default async function BarOverviewPage() {
  const supabase = createServiceClient();

  const todayStart  = jamaicaMidnight();
  const weekStart   = jamaicaMidnight(7);
  const monthStart  = jamaicaMidnight(30);

  const [
    { data: todayAllTabs, error: e1 },
    { data: openTabs,      error: e2 },
    { data: weekClosed,    error: e3 },
    { data: monthClosed,   error: e4 },
    { count: totalItems },
    { count: activeMembers },
    { count: activeSessions },
    { data: todayVoids },
  ] = await Promise.all([
    supabase.from("pos_tabs").select("id, name, total_cents, status, created_at").gte("created_at", todayStart.toISOString()).order("created_at", { ascending: false }),
    // All still-open / away (customer left, unpaid) tabs — outstanding money, regardless of day.
    supabase.from("pos_tabs").select("id, name, total_cents, status, created_at").in("status", ["open", "away"]).order("created_at", { ascending: true }),
    supabase.from("pos_tabs").select("id, total_cents").eq("status", "closed").gte("closed_at", weekStart.toISOString()),
    supabase.from("pos_tabs").select("id, total_cents").eq("status", "closed").gte("closed_at", monthStart.toISOString()),
    supabase.from("pos_items").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("gamer_members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("game_sessions").select("id", { count: "exact", head: true }).is("ended_at", null),
    supabase.from("pos_voids").select("quantity, price_cents").gte("created_at", todayStart.toISOString()),
  ]);

  const openList = openTabs ?? [];
  const openTotal = openList.reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  const voidsToday = todayVoids ?? [];
  const voidCountToday = voidsToday.reduce((sum, v) => sum + (v.quantity ?? 1), 0);
  const voidValueToday = voidsToday.reduce((sum, v) => sum + (v.price_cents ?? 0) * (v.quantity ?? 1), 0);

  const todayClosedTabs = (todayAllTabs ?? []).filter(t => t.status === "closed");
  const todayRevenue  = todayClosedTabs.reduce((sum, t) => sum + (t.total_cents ?? 0), 0);
  const weekRevenue   = (weekClosed  ?? []).reduce((sum, t) => sum + (t.total_cents ?? 0), 0);
  const monthRevenue  = (monthClosed ?? []).reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  // Cost of goods sold = Σ(quantity × cost snapshotted at sale) over each window's closed tabs.
  // Sessions revenue (game_sessions) is a separate stream and is excluded here, as it is from revenue above.
  const todayTabIds = todayClosedTabs.map(t => t.id);
  const weekTabIds  = (weekClosed  ?? []).map(t => t.id);
  const monthTabIds = (monthClosed ?? []).map(t => t.id);
  const allTabIds = Array.from(new Set([...todayTabIds, ...weekTabIds, ...monthTabIds]));

  const costByTab: Record<string, number> = {};
  let costError = null;
  if (allTabIds.length > 0) {
    const { data: lineItems, error } = await supabase
      .from("pos_tab_items")
      .select("tab_id, quantity, cost_cents")
      .in("tab_id", allTabIds);
    costError = error;
    for (const li of lineItems ?? []) {
      costByTab[li.tab_id] = (costByTab[li.tab_id] ?? 0) + (li.quantity ?? 1) * (li.cost_cents ?? 0);
    }
  }

  // Surface (don't swallow) failures on the money queries — otherwise a transient
  // error renders "$0 revenue / no open tabs" as if it were real.
  const loadError = e1 || e2 || e3 || e4 || costError;
  if (loadError) {
    Sentry.captureException(loadError, { tags: { area: "bar-overview" } });
  }
  const sumCost = (ids: string[]) => ids.reduce((s, id) => s + (costByTab[id] ?? 0), 0);

  const windows = [
    { label: "Today",      revenue: todayRevenue, cost: sumCost(todayTabIds) },
    { label: "This Week",  revenue: weekRevenue,  cost: sumCost(weekTabIds)  },
    { label: "This Month", revenue: monthRevenue, cost: sumCost(monthTabIds) },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Overview</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {loadError && (
        <div className="rounded-lg border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">
          Some figures below couldn&apos;t be loaded, so revenue, profit, and open-tab totals may be incomplete. Refresh to try again.
        </div>
      )}

      {/* Revenue + profit totals (admin only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {windows.map((w) => {
          const profit = w.revenue - w.cost;
          const margin = w.revenue > 0 ? Math.round((profit / w.revenue) * 100) : null;
          return (
            <div key={w.label} className="border border-bone/10 rounded-lg p-4">
              <p className="text-xs text-bone/60 mb-1">{w.label}</p>
              <p className="text-2xl font-display font-bold text-bone">{formatCents(w.revenue)}</p>
              <p className="text-[11px] text-bone/40 mt-0.5">revenue</p>
              <div className="mt-3 pt-3 border-t border-bone/10 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-bone/50">Cost</span>
                  <span className="font-mono text-bone/60">{formatCents(w.cost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-bone/70">Profit</span>
                  <span className={`font-mono font-bold ${profit < 0 ? "text-red-400" : "text-sage"}`}>
                    {formatCents(profit)}{margin != null && <span className="text-bone/40 font-normal"> · {margin}%</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="-mt-4 text-[11px] text-bone/35">
        Profit = tab revenue − cost of goods sold (cost locked at time of sale). Items without a cost set count as pure profit until you add their cost. Gaming session revenue is tracked separately.
      </p>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active Sessions", value: activeSessions ?? 0,  href: "/bar/sessions",        sub: undefined as string | undefined },
          { label: "Menu Items",      value: totalItems ?? 0,       href: "/admin/bar/inventory", sub: undefined },
          { label: "Gamer Members",   value: activeMembers ?? 0,    href: "/admin/bar/members",   sub: undefined },
          { label: "Canceled Today",  value: voidCountToday,        href: "/admin/bar/sales",     sub: formatCents(voidValueToday) },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-bone/10 rounded-lg p-4 hover:border-bone/25 transition-colors"
          >
            <p className="text-xs text-bone/60 mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-bone">{s.value}</p>
            {s.sub && <p className="text-[11px] text-bone/40 mt-0.5">{s.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Open tabs — outstanding money right now */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/52">Open Tabs ({openList.length})</h2>
          <span className="text-sm text-bone/60">
            Outstanding <span className="font-mono font-bold text-ochre">{formatCents(openTotal)}</span>
          </span>
        </div>

        {openList.length === 0 ? (
          <p className="text-sm text-bone/50">No open tabs.</p>
        ) : (
          <div className="border border-ochre/20 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Opened</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {openList.map((tab) => (
                  <tr key={tab.id} className="hover:bg-bone/3 transition-colors">
                    <td className="px-4 py-3 text-bone font-medium">
                      <Link href={`/bar/tabs/${tab.id}`} className="hover:text-ochre transition-colors">{tab.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-bone/50 text-xs">{jamaicaDateTime(tab.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={[
                        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                        tab.status === "away" ? "bg-red-400/15 text-red-400" : "bg-ochre/20 text-ochre",
                      ].join(" ")}>
                        {STATUS_LABELS[tab.status] ?? tab.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-bone">{formatCents(tab.total_cents ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-bone/10 bg-bone/3">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Outstanding</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-ochre">{formatCents(openTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Today's tabs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/52">Today&apos;s Tabs</h2>
          <Link href="/bar/tabs/new" className="text-xs text-ochre hover:underline">+ New Tab</Link>
        </div>

        {!todayAllTabs?.length ? (
          <p className="text-sm text-bone/50">No tabs opened today.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Total</th>
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
                        tab.status === "closed" ? "bg-forest/20 text-sage" :
                        tab.status === "open"   ? "bg-ochre/20 text-ochre" :
                        "bg-bone/10 text-bone/60",
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
