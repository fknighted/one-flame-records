import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient } from "@/lib/supabase/server";
import { formatJmd, jamaicaMidnight, jamaicaTime, jamaicaDateTime } from "@/lib/bar/pos";

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
    supabase.from("pos_tabs").select("id, name, total_jmd, status, created_at").gte("created_at", todayStart.toISOString()).order("created_at", { ascending: false }),
    // All still-open / away (customer left, unpaid) tabs — outstanding money, regardless of day.
    supabase.from("pos_tabs").select("id, name, total_jmd, status, created_at").in("status", ["open", "away"]).order("created_at", { ascending: true }),
    supabase.from("pos_tabs").select("id, total_jmd").eq("status", "closed").gte("closed_at", weekStart.toISOString()),
    supabase.from("pos_tabs").select("id, total_jmd").eq("status", "closed").gte("closed_at", monthStart.toISOString()),
    supabase.from("pos_items").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("gamer_members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("game_sessions").select("id", { count: "exact", head: true }).is("ended_at", null),
    supabase.from("pos_voids").select("quantity, price_jmd").gte("created_at", todayStart.toISOString()),
  ]);

  const openList = openTabs ?? [];
  const openTotal = openList.reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);

  const voidsToday = todayVoids ?? [];
  const voidCountToday = voidsToday.reduce((sum, v) => sum + (v.quantity ?? 1), 0);
  const voidValueToday = voidsToday.reduce((sum, v) => sum + (v.price_jmd ?? 0) * (v.quantity ?? 1), 0);

  const todayClosedTabs = (todayAllTabs ?? []).filter(t => t.status === "closed");
  const todayRevenue  = todayClosedTabs.reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);
  const weekRevenue   = (weekClosed  ?? []).reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);
  const monthRevenue  = (monthClosed ?? []).reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);

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
      .select("tab_id, quantity, cost_jmd")
      .in("tab_id", allTabIds);
    costError = error;
    for (const li of lineItems ?? []) {
      costByTab[li.tab_id] = (costByTab[li.tab_id] ?? 0) + (li.quantity ?? 1) * (li.cost_jmd ?? 0);
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
        <p className="studio-label mb-1">Bar</p>
        <h1 className="studio-page-title">Overview</h1>
      </div>

      {loadError && (
        <div role="alert" className="studio-error">
          Some figures below couldn&apos;t be loaded, so revenue, profit, and open-tab totals may be incomplete. Refresh to try again.
        </div>
      )}

      {/* Revenue + profit totals (admin only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {windows.map((w) => {
          const profit = w.revenue - w.cost;
          const margin = w.revenue > 0 ? Math.round((profit / w.revenue) * 100) : null;
          return (
            <div key={w.label} className="studio-stat">
              <p className="studio-stat-label">{w.label}</p>
              <p className="studio-stat-value is-money text-[36px]">{formatJmd(w.revenue)}</p>
              <p className="text-[13px] text-muted">revenue</p>
              <div className="pt-3 border-t border-line space-y-1">
                <div className="flex justify-between items-baseline gap-3 text-[14px]">
                  <span className="text-muted">Cost</span>
                  <span className="studio-figures text-muted">{formatJmd(w.cost)}</span>
                </div>
                <div className="flex justify-between items-baseline gap-3 text-[15px]">
                  <span className="text-paper">Profit</span>
                  <span className="text-right">
                    <span className="studio-money text-[20px]">{formatJmd(profit)}</span>
                    {margin != null && <span className="text-muted font-normal studio-figures"> · {margin}%</span>}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="-mt-4 studio-hint">
        Profit = tab revenue − cost of goods sold (cost locked at time of sale). Items without a cost set count as pure profit until you add their cost. Gaming session revenue is tracked separately.
      </p>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Active Sessions", value: activeSessions ?? 0,  href: "/bar/sessions",        sub: undefined as string | undefined },
          { label: "Menu Items",      value: totalItems ?? 0,       href: "/admin/bar/inventory", sub: undefined },
          { label: "Gamer Members",   value: activeMembers ?? 0,    href: "/admin/bar/members",   sub: undefined },
          { label: "Canceled Today",  value: voidCountToday,        href: "/admin/bar/sales",     sub: formatJmd(voidValueToday) },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="studio-stat studio-focus hover:bg-raised"
          >
            <p className="studio-stat-label">{s.label}</p>
            <p className="studio-stat-value">{s.value}</p>
            {s.sub && <p className="studio-money text-[18px]">{s.sub}</p>}
          </Link>
        ))}
      </div>

      {/* Open tabs — outstanding money right now */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="studio-label">Open Tabs ({openList.length})</h2>
          <span className="text-[15px] text-muted">
            Outstanding <span className="studio-money">{formatJmd(openTotal)}</span>
          </span>
        </div>

        {openList.length === 0 ? (
          <p className="text-[15px] text-muted">No open tabs.</p>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[400px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Opened</th>
                  <th>Status</th>
                  <th className="is-num">Total</th>
                </tr>
              </thead>
              <tbody>
                {openList.map((tab) => (
                  <tr key={tab.id} className="is-link">
                    <td className="font-semibold [overflow-wrap:anywhere]">
                      <Link href={`/bar/tabs/${tab.id}`} className="studio-link inline-flex min-h-[44px] items-center">{tab.name}</Link>
                    </td>
                    <td className="studio-figures text-muted">{jamaicaDateTime(tab.created_at)}</td>
                    <td>
                      <span className={tab.status === "away" ? "studio-chip studio-chip-neutral" : "studio-chip studio-chip-ok"}>
                        {STATUS_LABELS[tab.status] ?? tab.status}
                      </span>
                    </td>
                    <td className="is-num"><span className="studio-money">{formatJmd(tab.total_jmd ?? 0)}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-[13px] font-semibold text-muted border-t border-line">Outstanding</td>
                  <td className="is-num px-4 py-3 border-t border-line"><span className="studio-money">{formatJmd(openTotal)}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Today's tabs */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="studio-label">Today&apos;s Tabs</h2>
          <Link href="/bar/tabs/new" className="studio-btn studio-btn-secondary studio-btn-sm">+ New Tab</Link>
        </div>

        {!todayAllTabs?.length ? (
          <p className="text-[15px] text-muted">No tabs opened today.</p>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[400px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th className="is-num">Total</th>
                </tr>
              </thead>
              <tbody>
                {todayAllTabs.map((tab) => (
                  <tr key={tab.id} className="is-link">
                    <td className="font-semibold [overflow-wrap:anywhere]">
                      {tab.status === "open" ? (
                        <Link href={`/bar/tabs/${tab.id}`} className="studio-link inline-flex min-h-[44px] items-center">{tab.name}</Link>
                      ) : tab.name}
                    </td>
                    <td className="studio-figures text-muted">
                      {jamaicaTime(tab.created_at)}
                    </td>
                    <td>
                      <span className={
                        tab.status === "open"
                          ? "studio-chip studio-chip-ok"
                          : "studio-chip studio-chip-neutral"
                      }>
                        {STATUS_LABELS[tab.status] ?? tab.status}
                      </span>
                    </td>
                    <td className="is-num">
                      <span className="studio-money">{formatJmd(tab.total_jmd ?? 0)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="flex flex-wrap gap-2">
        <Link href="/admin/bar/sales"     className="studio-btn studio-btn-secondary studio-btn-sm">Sales Report</Link>
        <Link href="/admin/bar/inventory" className="studio-btn studio-btn-secondary studio-btn-sm">Inventory</Link>
        <Link href="/admin/bar/items"     className="studio-btn studio-btn-secondary studio-btn-sm">Manage Menu</Link>
        <Link href="/admin/bar/tabs"      className="studio-btn studio-btn-secondary studio-btn-sm">Order History</Link>
      </section>
    </div>
  );
}
