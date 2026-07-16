import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/bar/pos";
import AddStockForm, { type StockTarget } from "@/components/AddStockForm";
import { addStock } from "./actions";

// NOTE: bartenders see stock only — no cost, margin, or profit is queried or shown here.
type Item = {
  id: string;
  name: string;
  category: string;
  stock_quantity: number | null;
  reorder_level: number | null;
  bottle_group: string | null;
  bottle_yield: number | null;
  price_cents: number;
};

function StockBadge({ item }: { item: Item }) {
  const stock = item.stock_quantity;
  const threshold = item.reorder_level ?? 5;
  if (stock === null) return <span className="text-bone/50 text-xs">not tracked</span>;
  if (stock === 0) return <span className="text-red-400 font-bold text-sm">OUT</span>;
  const low = stock < threshold;
  return <span className={`font-mono font-bold text-sm ${low ? "text-red-400" : "text-bone"}`}>{stock}</span>;
}

export default async function BarInventoryPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  const { data: items } = await supabase
    .from("pos_items")
    .select("id, name, category, stock_quantity, reorder_level, bottle_group, bottle_yield, price_cents")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name");

  const allItems = (items ?? []) as Item[];

  const grouped: Record<string, Item[]> = {};
  for (const item of allItems) {
    (grouped[item.category] ??= []).push(item);
  }

  const needsRestock = allItems
    .filter((item) => item.stock_quantity !== null && item.stock_quantity < (item.reorder_level ?? 5))
    .sort((a, b) => (a.stock_quantity ?? 999) - (b.stock_quantity ?? 999));

  const toTarget = (i: Item): StockTarget => ({
    id: i.id,
    name: i.name,
    bottleYield: i.bottle_yield,
    priceCents: i.price_cents,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-bone text-2xl">Inventory</h1>
        <p className="mt-1 text-sm text-bone/60">Add stock as you buy it. You can add but not remove — an admin adjusts counts.</p>
      </div>

      {needsRestock.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
            Needs Restocking ({needsRestock.length})
          </h2>
          <div className="border border-red-400/20 rounded-lg overflow-x-auto bg-red-400/5">
            <table className="w-full min-w-[360px] text-sm">
              <tbody className="divide-y divide-red-400/10">
                {needsRestock.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-bone font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-bone/60">{CATEGORY_LABELS[item.category] ?? item.category}</td>
                    <td className="px-4 py-3 text-right">
                      {item.stock_quantity === 0 ? (
                        <span className="text-red-400 font-bold text-sm">OUT</span>
                      ) : (
                        <span className="font-mono font-bold text-sm text-red-400">{item.stock_quantity} left</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => {
        const catItems = grouped[cat]!;
        const rendered = new Set<string>();

        return (
          <section key={cat} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {catItems.map((item) => {
                if (rendered.has(item.id)) return null;

                // Bottle-family items share one add card (choose shot / flask / bottle).
                if (item.bottle_group) {
                  const siblings = catItems.filter((i) => i.bottle_group === item.bottle_group);
                  siblings.forEach((s) => rendered.add(s.id));
                  const title = item.bottle_group.charAt(0).toUpperCase() + item.bottle_group.slice(1);
                  return (
                    <div key={item.bottle_group} className="rounded-lg border border-bone/10 p-4 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <h3 className="text-bone font-medium">{title}</h3>
                        <span className="text-[11px] text-bone/40">by the bottle</span>
                      </div>
                      <div className="space-y-1">
                        {siblings.map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-sm">
                            <span className="text-bone/70">{s.name}</span>
                            <StockBadge item={s} />
                          </div>
                        ))}
                      </div>
                      <AddStockForm action={addStock} targets={siblings.map(toTarget)} />
                    </div>
                  );
                }

                rendered.add(item.id);
                return (
                  <div key={item.id} className="rounded-lg border border-bone/10 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-bone font-medium">{item.name}</h3>
                      <StockBadge item={item} />
                    </div>
                    <AddStockForm action={addStock} targets={[toTarget(item)]} />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
