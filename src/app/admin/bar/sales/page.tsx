import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCents, CATEGORY_LABELS as BASE_CATEGORY_LABELS, jamaicaMidnight, jamaicaDateTime } from "@/lib/bar/pos";

const CATEGORY_LABELS: Record<string, string> = {
  ...BASE_CATEGORY_LABELS,
  drink: "Drinks (Alcoholic)",
  other: "Other",
};

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all",   label: "All Time" },
];

function periodStart(period: string): string | null {
  if (period === "today") return jamaicaMidnight().toISOString();
  if (period === "week")  return jamaicaMidnight(7).toISOString();
  if (period === "month") return jamaicaMidnight(30).toISOString();
  return null;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "today" } = await searchParams;
  const supabase = createServiceClient();

  const start = periodStart(period);

  // ── Aggregated sales figures for the period (grouped in Postgres) ──────────
  const [
    { data: paymentRows, error: payError },
    { data: categoryData, error: catError },
    { data: topItemData, error: topError },
  ] = await Promise.all([
    supabase.rpc("bar_sales_payment_summary", { p_start: start }),
    supabase.rpc("bar_sales_by_category", { p_start: start }),
    supabase.rpc("bar_sales_top_items", { p_start: start, p_limit: 10 }),
  ]);

  // ── Still-open / away tabs (outstanding money, independent of the period) ──
  const { data: openTabsData, error: openError } = await supabase
    .from("pos_tabs")
    .select("id, name, total_cents, status, created_at")
    .in("status", ["open", "away"])
    .order("created_at", { ascending: true });
  const openTabs = openTabsData ?? [];
  const openTotal = openTabs.reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  // ── Canceled sales (voids) in the period ──────────────────────────────────
  let voidQuery = supabase
    .from("pos_voids")
    .select("name, quantity, price_cents, reason, created_at")
    .order("created_at", { ascending: false });
  if (start) voidQuery = voidQuery.gte("created_at", start);
  const { data: voidsData } = await voidQuery;
  const voids = voidsData ?? [];
  const voidCount = voids.reduce((sum, v) => sum + (v.quantity ?? 1), 0);
  const voidValue = voids.reduce((sum, v) => sum + (v.price_cents ?? 0) * (v.quantity ?? 1), 0);

  // Surface (don't swallow) money-query failures rather than rendering $0 as real.
  const loadError = payError || catError || topError || openError;
  if (loadError) {
    Sentry.captureException(loadError, { tags: { area: "bar-sales" }, extra: { period } });
  }

  // ── Derive view models from the aggregated rows ───────────────────────────
  const payments = paymentRows ?? [];
  const categories = categoryData ?? [];
  const items = topItemData ?? [];

  // Revenue is the sum of closed-tab totals (tip excluded, as before); cost of
  // goods is the sum of line-item cost snapshots. Missing cost counts as 0.
  const totalRevenue   = payments.reduce((sum, p) => sum + (p.revenue_cents ?? 0), 0);
  const tabsClosed     = payments.reduce((sum, p) => sum + (p.tab_count ?? 0), 0);
  const totalItemsSold = categories.reduce((sum, c) => sum + (c.qty ?? 0), 0);
  const totalCost      = categories.reduce((sum, c) => sum + (c.cost_cents ?? 0), 0);
  const totalProfit    = totalRevenue - totalCost;
  const totalMargin    = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : null;

  // By category, sorted by revenue (matches the previous Object.entries order).
  const categoryRows = categories
    .map((c): [string, { qty: number; cents: number; cost: number }] => [
      c.category,
      { qty: c.qty, cents: c.revenue_cents, cost: c.cost_cents },
    ])
    .sort(([, a], [, b]) => b.cents - a.cents);

  // Top items already arrive sorted by revenue (limit 10).
  const topItems = items.map(
    (it): [string, { category: string; qty: number; cents: number; cost: number }] => [
      it.name,
      { category: it.category, qty: it.qty, cents: it.revenue_cents, cost: it.cost_cents },
    ]
  );

  // Payment-method split.
  const byPayment: Record<string, { count: number; cents: number }> = {};
  for (const p of payments) {
    byPayment[p.payment_method] = { count: p.tab_count, cents: p.revenue_cents };
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Sales</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {loadError && (
        <div className="rounded-lg border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose">
          Some sales data couldn&apos;t be loaded, so the totals below may be incomplete. Refresh to try again.
        </div>
      )}

      {/* Period filter */}
      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((p) => (
          <Link
            key={p.value}
            href={p.value === "today" ? "/admin/bar/sales" : `/admin/bar/sales?period=${p.value}`}
            className={[
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              period === p.value
                ? "bg-ochre text-ink"
                : "bg-bone/10 text-bone/60 hover:bg-bone/20",
            ].join(" ")}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Open tabs — outstanding now, independent of the period filter */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">Open Tabs ({openTabs.length})</h2>
          <span className="text-sm text-bone/60">
            Outstanding <span className="font-mono font-bold text-ochre">{formatCents(openTotal)}</span>
          </span>
        </div>
        {openTabs.length === 0 ? (
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
                {openTabs.map((tab) => (
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
                        {tab.status === "away" ? "Away" : "Open"}
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

      {/* Canceled sales (voids) — un-sold items, stock restored, logged here */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">Canceled ({voidCount})</h2>
          <span className="text-sm text-bone/60">
            Value <span className="font-mono font-bold text-bone/70">{formatCents(voidValue)}</span>
          </span>
        </div>
        {voids.length === 0 ? (
          <p className="text-sm text-bone/50">No canceled items for this period.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Item</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Qty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">When</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {voids.map((v, i) => (
                  <tr key={i} className="hover:bg-bone/3 transition-colors">
                    <td className="px-4 py-3 text-bone font-medium">{v.name}</td>
                    <td className="px-4 py-3 text-right font-mono text-bone/70">{v.quantity ?? 1}</td>
                    <td className="px-4 py-3 text-bone/50">{v.reason || <span className="text-bone/30">—</span>}</td>
                    <td className="px-4 py-3 text-bone/50 text-xs">{jamaicaDateTime(v.created_at)}</td>
                    <td className="px-4 py-3 text-right font-mono text-bone/60">{formatCents((v.price_cents ?? 0) * (v.quantity ?? 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {tabsClosed === 0 ? (
        <p className="text-sm text-bone/50">No closed tabs for this period.</p>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Revenue",  value: formatCents(totalRevenue), tone: "text-bone" },
              { label: "Cost of Goods",  value: formatCents(totalCost),    tone: "text-bone/60" },
              { label: "Profit",         value: formatCents(totalProfit),  tone: totalProfit < 0 ? "text-red-400" : "text-sage", sub: totalMargin != null ? `${totalMargin}% margin` : undefined },
              { label: "Items Sold",     value: totalItemsSold.toString(), tone: "text-bone" },
              { label: "Tabs Closed",    value: tabsClosed.toString(), tone: "text-bone" },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border border-bone/10 bg-bone/3 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-bone/60 mb-1">{card.label}</p>
                <p className={`font-mono text-2xl font-bold ${card.tone}`}>{card.value}</p>
                {card.sub && <p className="text-[11px] text-bone/40 mt-0.5">{card.sub}</p>}
              </div>
            ))}
          </div>
          <p className="-mt-4 text-[11px] text-bone/35">
            Profit uses cost captured at time of sale. Items sold before a cost was set (or with no cost) count as pure profit.
          </p>

          {/* Revenue by category */}
          {categoryRows.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">By Category</h2>
              <div className="border border-bone/10 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="border-b border-bone/10 bg-bone/3">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Qty Sold</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Revenue</th>
                      <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Cost</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bone/10">
                    {categoryRows.map(([cat, data]) => {
                      const profit = data.cents - data.cost;
                      return (
                        <tr key={cat} className="hover:bg-bone/3 transition-colors">
                          <td className="px-4 py-3 text-bone font-medium">{CATEGORY_LABELS[cat] ?? cat}</td>
                          <td className="px-4 py-3 text-right font-mono text-bone/70">{data.qty}</td>
                          <td className="px-4 py-3 text-right font-mono text-bone">{formatCents(data.cents)}</td>
                          <td className="hidden sm:table-cell px-4 py-3 text-right font-mono text-bone/50">{formatCents(data.cost)}</td>
                          <td className={`px-4 py-3 text-right font-mono ${profit < 0 ? "text-red-400" : "text-sage"}`}>{formatCents(profit)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Top items */}
          {topItems.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">Top Items</h2>
              <div className="border border-bone/10 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="border-b border-bone/10 bg-bone/3">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Item</th>
                      <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Revenue</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bone/10">
                    {topItems.map(([name, data]) => {
                      const profit = data.cents - data.cost;
                      return (
                        <tr key={name} className="hover:bg-bone/3 transition-colors">
                          <td className="px-4 py-3 text-bone font-medium">{name}</td>
                          <td className="hidden sm:table-cell px-4 py-3 text-bone/50">{CATEGORY_LABELS[data.category] ?? data.category}</td>
                          <td className="px-4 py-3 text-right font-mono text-bone/70">{data.qty}</td>
                          <td className="px-4 py-3 text-right font-mono text-bone">{formatCents(data.cents)}</td>
                          <td className={`px-4 py-3 text-right font-mono ${profit < 0 ? "text-red-400" : "text-sage"}`}>{formatCents(profit)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Payment method split */}
          {Object.keys(byPayment).length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">Payment Methods</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(byPayment).map(([method, data]) => (
                  <div key={method} className="rounded-lg border border-bone/10 bg-bone/3 px-5 py-4 min-w-[140px]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-bone/60 mb-1 capitalize">{method}</p>
                    <p className="font-mono text-bone text-xl font-bold">{formatCents(data.cents)}</p>
                    <p className="text-xs text-bone/60 mt-0.5">{data.count} tab{data.count !== 1 ? "s" : ""}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
