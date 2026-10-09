import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient } from "@/lib/supabase/server";
import { formatJmd, CATEGORY_LABELS as BASE_CATEGORY_LABELS, jamaicaMidnight, jamaicaDateTime } from "@/lib/bar/pos";

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
    .select("id, name, total_jmd, status, created_at")
    .in("status", ["open", "away"])
    .order("created_at", { ascending: true });
  const openTabs = openTabsData ?? [];
  const openTotal = openTabs.reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);

  // ── Canceled sales (voids) in the period ──────────────────────────────────
  let voidQuery = supabase
    .from("pos_voids")
    .select("name, quantity, price_jmd, reason, created_at")
    .order("created_at", { ascending: false });
  if (start) voidQuery = voidQuery.gte("created_at", start);
  const { data: voidsData } = await voidQuery;
  const voids = voidsData ?? [];
  const voidCount = voids.reduce((sum, v) => sum + (v.quantity ?? 1), 0);
  const voidValue = voids.reduce((sum, v) => sum + (v.price_jmd ?? 0) * (v.quantity ?? 1), 0);

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
  const totalRevenue   = payments.reduce((sum, p) => sum + (p.revenue_jmd ?? 0), 0);
  const tabsClosed     = payments.reduce((sum, p) => sum + (p.tab_count ?? 0), 0);
  const totalItemsSold = categories.reduce((sum, c) => sum + (c.qty ?? 0), 0);
  const totalCost      = categories.reduce((sum, c) => sum + (c.cost_jmd ?? 0), 0);
  const totalProfit    = totalRevenue - totalCost;
  const totalMargin    = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : null;

  // By category, sorted by revenue (matches the previous Object.entries order).
  const categoryRows = categories
    .map((c): [string, { qty: number; jmd: number; cost: number }] => [
      c.category,
      { qty: c.qty, jmd: c.revenue_jmd, cost: c.cost_jmd },
    ])
    .sort(([, a], [, b]) => b.jmd - a.jmd);

  // Top items already arrive sorted by revenue (limit 10).
  const topItems = items.map(
    (it): [string, { category: string; qty: number; jmd: number; cost: number }] => [
      it.name,
      { category: it.category, qty: it.qty, jmd: it.revenue_jmd, cost: it.cost_jmd },
    ]
  );

  // Payment-method split.
  const byPayment: Record<string, { count: number; jmd: number }> = {};
  for (const p of payments) {
    byPayment[p.payment_method] = { count: p.tab_count, jmd: p.revenue_jmd };
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <p className="studio-label mb-1">Bar</p>
        <h1 className="studio-page-title">Sales</h1>
      </div>

      {loadError && (
        <div role="alert" className="studio-error">
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
              "studio-focus inline-flex min-h-[44px] items-center px-4 text-[14px] font-semibold",
              period === p.value
                ? "bg-raised text-paper border border-muted"
                : "text-muted border border-line hover:text-paper",
            ].join(" ")}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Open tabs — outstanding now, independent of the period filter */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="studio-label">Open Tabs ({openTabs.length})</h2>
          <span className="text-[15px] text-muted">
            Outstanding <span className="studio-money">{formatJmd(openTotal)}</span>
          </span>
        </div>
        {openTabs.length === 0 ? (
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
                {openTabs.map((tab) => (
                  <tr key={tab.id} className="is-link">
                    <td className="font-semibold [overflow-wrap:anywhere]">
                      <Link href={`/bar/tabs/${tab.id}`} className="studio-link inline-flex min-h-[44px] items-center">{tab.name}</Link>
                    </td>
                    <td className="studio-figures text-muted">{jamaicaDateTime(tab.created_at)}</td>
                    <td>
                      <span className={tab.status === "away" ? "studio-chip studio-chip-neutral" : "studio-chip studio-chip-ok"}>
                        {tab.status === "away" ? "Away" : "Open"}
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

      {/* Canceled sales (voids) — un-sold items, stock restored, logged here */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="studio-label">Canceled ({voidCount})</h2>
          <span className="text-[15px] text-muted">
            Value <span className="studio-money">{formatJmd(voidValue)}</span>
          </span>
        </div>
        {voids.length === 0 ? (
          <p className="text-[15px] text-muted">No canceled items for this period.</p>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[480px]">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="is-num">Qty</th>
                  <th>Reason</th>
                  <th>When</th>
                  <th className="is-num">Value</th>
                </tr>
              </thead>
              <tbody>
                {voids.map((v, i) => (
                  <tr key={i} className="is-link">
                    <td className="font-semibold [overflow-wrap:anywhere]">{v.name}</td>
                    <td className="is-num"><span className="studio-count">{v.quantity ?? 1}</span></td>
                    <td className="text-muted">{v.reason || "—"}</td>
                    <td className="studio-figures text-muted">{jamaicaDateTime(v.created_at)}</td>
                    <td className="is-num"><span className="studio-money">{formatJmd((v.price_jmd ?? 0) * (v.quantity ?? 1))}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {tabsClosed === 0 ? (
        <p className="text-[15px] text-muted">No closed tabs for this period.</p>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Total Revenue",  value: formatJmd(totalRevenue), money: true },
              { label: "Cost of Goods",  value: formatJmd(totalCost),    money: true },
              { label: "Profit",         value: formatJmd(totalProfit),  money: true, sub: totalMargin != null ? `${totalMargin}% margin` : undefined },
              { label: "Items Sold",     value: totalItemsSold.toString(), money: false },
              { label: "Tabs Closed",    value: tabsClosed.toString(), money: false },
            ].map((card) => (
              <div key={card.label} className="studio-stat">
                <p className="studio-stat-label">{card.label}</p>
                <p className={`studio-stat-value text-[32px] ${card.money ? "is-money" : ""}`}>{card.value}</p>
                {card.sub && <p className="text-[13px] text-muted">{card.sub}</p>}
              </div>
            ))}
          </div>
          <p className="-mt-4 studio-hint">
            Profit uses cost captured at time of sale. Items sold before a cost was set (or with no cost) count as pure profit.
          </p>

          {/* Revenue by category */}
          {categoryRows.length > 0 && (
            <section className="space-y-3">
              <h2 className="studio-label">By Category</h2>
              <div className="studio-table-wrap">
                <table className="studio-table min-w-[520px]">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="is-num">Qty Sold</th>
                      <th className="is-num">Revenue</th>
                      <th className="hidden sm:table-cell is-num">Cost</th>
                      <th className="is-num">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRows.map(([cat, data]) => {
                      const profit = data.jmd - data.cost;
                      return (
                        <tr key={cat} className="is-link">
                          <td className="font-semibold">{CATEGORY_LABELS[cat] ?? cat}</td>
                          <td className="is-num"><span className="studio-count">{data.qty}</span></td>
                          <td className="is-num"><span className="studio-money">{formatJmd(data.jmd)}</span></td>
                          <td className="hidden sm:table-cell is-num studio-figures text-muted">{formatJmd(data.cost)}</td>
                          <td className="is-num"><span className="studio-money">{formatJmd(profit)}</span></td>
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
              <h2 className="studio-label">Top Items</h2>
              <div className="studio-table-wrap">
                <table className="studio-table min-w-[520px]">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="hidden sm:table-cell">Category</th>
                      <th className="is-num">Qty</th>
                      <th className="is-num">Revenue</th>
                      <th className="is-num">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map(([name, data]) => {
                      const profit = data.jmd - data.cost;
                      return (
                        <tr key={name} className="is-link">
                          <td className="font-semibold [overflow-wrap:anywhere]">{name}</td>
                          <td className="hidden sm:table-cell text-muted">{CATEGORY_LABELS[data.category] ?? data.category}</td>
                          <td className="is-num"><span className="studio-count">{data.qty}</span></td>
                          <td className="is-num"><span className="studio-money">{formatJmd(data.jmd)}</span></td>
                          <td className="is-num"><span className="studio-money">{formatJmd(profit)}</span></td>
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
              <h2 className="studio-label">Payment Methods</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(byPayment).map(([method, data]) => (
                  <div key={method} className="studio-stat min-w-[140px]">
                    <p className="studio-stat-label capitalize">{method}</p>
                    <p className="studio-money">{formatJmd(data.jmd)}</p>
                    <p className="text-[13px] text-muted">{data.count} tab{data.count !== 1 ? "s" : ""}</p>
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
