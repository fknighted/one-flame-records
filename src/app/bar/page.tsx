import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { formatCents, jamaicaMidnight, jamaicaTime } from "@/lib/bar/pos";

function elapsed(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default async function BarDashboardPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  const { data: todayTabs } = await supabase
    .from("pos_tabs")
    .select("id, name, total_cents, status, created_at, closed_at, notes")
    .gte("created_at", jamaicaMidnight().toISOString())
    .order("created_at", { ascending: false });

  const openTabs   = (todayTabs ?? []).filter((t) => t.status === "open");
  const closedTabs = (todayTabs ?? []).filter((t) => t.status === "closed");
  const voidedTabs = (todayTabs ?? []).filter((t) => t.status === "voided");

  const todayRevenue = closedTabs.reduce((sum, t) => sum + (t.total_cents ?? 0), 0);
  const openRunning  = openTabs.reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-bone text-2xl">Active Tabs</h1>
        <Link
          href="/bar/tabs/new"
          className="bg-ochre text-ink text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-ochre/90 transition-colors"
        >
          + Open Tab
        </Link>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-bone/10 rounded-lg p-3">
          <p className="text-[10px] text-bone/40 uppercase tracking-wider mb-1">Today&apos;s Sales</p>
          <p className="text-xl font-display font-bold text-bone">{formatCents(todayRevenue)}</p>
        </div>
        <div className="border border-bone/10 rounded-lg p-3">
          <p className="text-[10px] text-bone/40 uppercase tracking-wider mb-1">Open Running</p>
          <p className="text-xl font-display font-bold text-ochre">{formatCents(openRunning)}</p>
        </div>
        <div className="border border-bone/10 rounded-lg p-3">
          <p className="text-[10px] text-bone/40 uppercase tracking-wider mb-1">Tabs Closed</p>
          <p className="text-xl font-display font-bold text-bone">{closedTabs.length}</p>
        </div>
      </div>

      {/* Open tabs */}
      {!openTabs.length ? (
        <div className="border border-bone/10 rounded-xl p-10 text-center text-bone/30">
          <p className="text-lg mb-2">No open tabs</p>
          <Link href="/bar/tabs/new" className="text-sm text-ochre hover:underline">Open the first one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {openTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/bar/tabs/${tab.id}`}
              className="border border-bone/15 rounded-xl p-4 hover:border-ochre/40 hover:bg-bone/3 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-display font-bold text-bone text-lg leading-tight">{tab.name}</h2>
                <span className="text-xs text-bone/40 mt-1">{elapsed(tab.created_at)}</span>
              </div>
              {tab.notes && <p className="text-xs text-bone/40 mb-3">{tab.notes}</p>}
              <p className="text-2xl font-mono text-ochre">{formatCents(tab.total_cents ?? 0)}</p>
            </Link>
          ))}
        </div>
      )}

      {/* All today's tabs — closed + voided */}
      {(closedTabs.length > 0 || voidedTabs.length > 0) && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35">Settled Today</h2>
          <div className="border border-bone/10 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Opened</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Closed</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {[...closedTabs, ...voidedTabs]
                  .sort((a, b) => new Date(b.closed_at ?? b.created_at).getTime() - new Date(a.closed_at ?? a.created_at).getTime())
                  .map((tab) => (
                    <tr key={tab.id} className={tab.status === "voided" ? "opacity-40" : ""}>
                      <td className="px-4 py-3 text-bone font-medium">{tab.name}</td>
                      <td className="px-4 py-3 text-bone/50 text-xs font-mono">
                        {jamaicaTime(tab.created_at)}
                      </td>
                      <td className="px-4 py-3 text-bone/50 text-xs font-mono">
                        {tab.closed_at ? jamaicaTime(tab.closed_at) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-bone">
                        {tab.status === "voided"
                          ? <span className="text-bone/30">voided</span>
                          : formatCents(tab.total_cents ?? 0)}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot className="border-t border-bone/10 bg-bone/3">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-bone/50">Day Total</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-bone">{formatCents(todayRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
