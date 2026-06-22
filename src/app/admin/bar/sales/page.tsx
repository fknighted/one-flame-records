import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCents, CATEGORY_LABELS as BASE_CATEGORY_LABELS, jamaicaMidnight } from "@/lib/bar/pos";

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

  // ── Fetch closed tabs in period ───────────────────────────────────────────
  let tabQuery = supabase
    .from("pos_tabs")
    .select("id, payment_method, total_cents, closed_at")
    .eq("status", "closed")
    .order("closed_at", { ascending: false });

  const start = periodStart(period);
  if (start) tabQuery = tabQuery.gte("closed_at", start);

  const { data: tabs } = await tabQuery;
  const closedTabs = tabs ?? [];
  const tabIds = closedTabs.map((t) => t.id);

  // ── Fetch line items for those tabs ───────────────────────────────────────
  const lineItems =
    tabIds.length > 0
      ? (
          await supabase
            .from("pos_tab_items")
            .select("name, price_cents, quantity, pos_items(category)")
            .in("tab_id", tabIds)
        ).data ?? []
      : [];

  // ── Aggregate ─────────────────────────────────────────────────────────────

  type LineItem = (typeof lineItems)[number];

  const totalRevenue = closedTabs.reduce((sum, t) => sum + (t.total_cents ?? 0), 0);
  const totalItemsSold = lineItems.reduce((sum, li) => sum + (li.quantity ?? 1), 0);

  // Revenue by category
  const byCategory: Record<string, { qty: number; cents: number }> = {};
  for (const li of lineItems) {
    const cat = (li.pos_items as { category: string } | null)?.category ?? "other";
    if (!byCategory[cat]) byCategory[cat] = { qty: 0, cents: 0 };
    byCategory[cat].qty   += li.quantity ?? 1;
    byCategory[cat].cents += (li.price_cents ?? 0) * (li.quantity ?? 1);
  }

  // Top items by revenue
  const byItem: Record<string, { category: string; qty: number; cents: number }> = {};
  for (const li of lineItems) {
    const cat = (li.pos_items as { category: string } | null)?.category ?? "other";
    const key = li.name;
    if (!byItem[key]) byItem[key] = { category: cat, qty: 0, cents: 0 };
    byItem[key].qty   += li.quantity ?? 1;
    byItem[key].cents += (li.price_cents ?? 0) * (li.quantity ?? 1);
  }
  const topItems = Object.entries(byItem)
    .sort(([, a], [, b]) => b.cents - a.cents)
    .slice(0, 10);

  // Payment method split
  const byPayment: Record<string, { count: number; cents: number }> = {};
  for (const tab of closedTabs) {
    const method = tab.payment_method ?? "unknown";
    if (!byPayment[method]) byPayment[method] = { count: 0, cents: 0 };
    byPayment[method].count += 1;
    byPayment[method].cents += tab.total_cents ?? 0;
  }

  const categoryRows = Object.entries(byCategory).sort(([, a], [, b]) => b.cents - a.cents);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Sales</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

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

      {closedTabs.length === 0 ? (
        <p className="text-sm text-bone/30">No closed tabs for this period.</p>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Revenue",  value: formatCents(totalRevenue) },
              { label: "Items Sold",     value: totalItemsSold.toString() },
              { label: "Tabs Closed",    value: closedTabs.length.toString() },
            ].map((card) => (
              <div key={card.label} className="rounded-lg border border-bone/10 bg-bone/3 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-bone/40 mb-1">{card.label}</p>
                <p className="font-mono text-bone text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue by category */}
          {categoryRows.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40">By Category</h2>
              <div className="border border-bone/10 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[440px] text-sm">
                  <thead className="border-b border-bone/10 bg-bone/3">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Qty Sold</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Revenue</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bone/10">
                    {categoryRows.map(([cat, data]) => (
                      <tr key={cat} className="hover:bg-bone/3 transition-colors">
                        <td className="px-4 py-3 text-bone font-medium">{CATEGORY_LABELS[cat] ?? cat}</td>
                        <td className="px-4 py-3 text-right font-mono text-bone/70">{data.qty}</td>
                        <td className="px-4 py-3 text-right font-mono text-bone">{formatCents(data.cents)}</td>
                        <td className="px-4 py-3 text-right font-mono text-bone/50">
                          {totalRevenue > 0 ? ((data.cents / totalRevenue) * 100).toFixed(1) : "0.0"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Top items */}
          {topItems.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40">Top Items</h2>
              <div className="border border-bone/10 rounded-lg overflow-x-auto">
                <table className="w-full min-w-[440px] text-sm">
                  <thead className="border-b border-bone/10 bg-bone/3">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Item</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Category</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bone/10">
                    {topItems.map(([name, data]) => (
                      <tr key={name} className="hover:bg-bone/3 transition-colors">
                        <td className="px-4 py-3 text-bone font-medium">{name}</td>
                        <td className="px-4 py-3 text-bone/50">{CATEGORY_LABELS[data.category] ?? data.category}</td>
                        <td className="px-4 py-3 text-right font-mono text-bone/70">{data.qty}</td>
                        <td className="px-4 py-3 text-right font-mono text-bone">{formatCents(data.cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Payment method split */}
          {Object.keys(byPayment).length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40">Payment Methods</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(byPayment).map(([method, data]) => (
                  <div key={method} className="rounded-lg border border-bone/10 bg-bone/3 px-5 py-4 min-w-[140px]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-bone/40 mb-1 capitalize">{method}</p>
                    <p className="font-mono text-bone text-xl font-bold">{formatCents(data.cents)}</p>
                    <p className="text-xs text-bone/40 mt-0.5">{data.count} tab{data.count !== 1 ? "s" : ""}</p>
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
