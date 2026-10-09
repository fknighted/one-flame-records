import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { formatJmd, jamaicaMidnight, jamaicaTime, elapsed } from "@/lib/bar/pos";

export default async function BarDashboardPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  // All open + away tabs — no date filter so carryover tabs appear
  const { data: openTabs } = await supabase
    .from("pos_tabs")
    .select("id, name, total_jmd, status, created_at, closed_at, notes")
    .in("status", ["open", "away"])
    .order("created_at", { ascending: false });

  // Today's settled tabs — use closed_at so tabs opened yesterday but paid today are included
  const { data: settledTabs } = await supabase
    .from("pos_tabs")
    .select("id, name, total_jmd, status, created_at, closed_at, notes")
    .in("status", ["closed", "voided"])
    .gte("closed_at", jamaicaMidnight().toISOString())
    .order("closed_at", { ascending: false });

  const closedTabs = (settledTabs ?? []).filter((t) => t.status === "closed");
  const voidedTabs = (settledTabs ?? []).filter((t) => t.status === "voided");

  const todayRevenue = closedTabs.reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);
  const openRunning  = (openTabs ?? []).reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="studio-page-title">Bar Tabs</h1>
        <Link href="/bar/tabs/new" className="studio-btn studio-btn-primary">
          + Open Tab
        </Link>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="studio-stat">
          <p className="studio-stat-label">Today&apos;s Sales</p>
          <p className="studio-stat-value is-money text-[32px]">{formatJmd(todayRevenue)}</p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">Unpaid Running</p>
          <p className="studio-stat-value is-money text-[32px]">{formatJmd(openRunning)}</p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">Tabs Closed</p>
          <p className="studio-stat-value text-[32px]">{closedTabs.length}</p>
        </div>
      </div>

      {/* Open tabs */}
      {!(openTabs ?? []).length ? (
        <div className="studio-empty">
          <p className="studio-empty-title">No open tabs</p>
          <Link href="/bar/tabs/new" className="studio-link inline-flex min-h-[44px] items-center">Open the first one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {(openTabs ?? []).map((tab) => (
            <Link
              key={tab.id}
              href={`/bar/tabs/${tab.id}`}
              className={`studio-card studio-focus block min-h-[44px] hover:bg-raised ${
                tab.status === "away" ? "border-muted" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h2 className="studio-section-title min-w-0 [overflow-wrap:anywhere]">{tab.name}</h2>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {tab.status === "away" ? (
                    <span className="studio-chip studio-chip-neutral">Left · Paying Later</span>
                  ) : (
                    <span className="studio-chip studio-chip-ok">Open</span>
                  )}
                  <span className="text-[13px] text-muted studio-figures">{elapsed(tab.created_at)}</span>
                </div>
              </div>
              {tab.notes && <p className="text-[13px] text-muted mb-3">{tab.notes}</p>}
              <p className="studio-money text-[28px]">{formatJmd(tab.total_jmd ?? 0)}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Today's settled tabs — closed + voided */}
      {(closedTabs.length > 0 || voidedTabs.length > 0) && (
        <section className="space-y-3">
          <h2 className="studio-label">Settled Today</h2>
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[400px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Opened</th>
                  <th>Closed</th>
                  <th className="is-num">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...closedTabs, ...voidedTabs]
                  .sort((a, b) => new Date(b.closed_at ?? b.created_at).getTime() - new Date(a.closed_at ?? a.created_at).getTime())
                  .map((tab) => (
                    <tr key={tab.id}>
                      <td className={`font-semibold [overflow-wrap:anywhere] ${tab.status === "voided" ? "text-muted" : ""}`}>{tab.name}</td>
                      <td className="studio-figures text-muted">
                        {jamaicaTime(tab.created_at)}
                      </td>
                      <td className="studio-figures text-muted">
                        {tab.closed_at ? jamaicaTime(tab.closed_at) : "—"}
                      </td>
                      <td className="is-num">
                        {tab.status === "voided"
                          ? <span className="studio-chip studio-chip-neutral">voided</span>
                          : <span className="studio-money">{formatJmd(tab.total_jmd ?? 0)}</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-[13px] font-semibold text-muted border-t border-line">Day Total</td>
                  <td className="is-num px-4 py-3 border-t border-line"><span className="studio-money">{formatJmd(todayRevenue)}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
