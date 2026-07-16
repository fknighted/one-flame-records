import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCents, marginPct, SECTION_LABELS, SECTION_ORDER, resolveSection, jamaicaMidnight } from "@/lib/bar/pos";
import { updateStock, addStock } from "./actions";
import DeleteMenuItemButton from "@/app/admin/bar/items/DeleteMenuItemButton";
import AddStockForm, { type StockTarget } from "@/components/AddStockForm";

type Item = {
  id: string;
  name: string;
  category: string;
  price_cents: number;
  cost_cents: number | null;
  stock_quantity: number | null;
  reorder_level: number | null;
  is_active: boolean;
  bottle_group: string | null;
  bottle_yield: number | null;
  bottle_parent_id: string | null;
  menu_section: string | null;
};

export default async function InventoryPage() {
  const supabase = createServiceClient();

  const todayStart = jamaicaMidnight();

  const [{ data: items }, { data: todayTabs }] = await Promise.all([
    supabase
      .from("pos_items")
      .select("id, name, category, price_cents, cost_cents, stock_quantity, reorder_level, is_active, bottle_group, bottle_yield, bottle_parent_id, menu_section")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name"),
    supabase
      .from("pos_tabs")
      .select("id")
      .eq("status", "closed")
      .gte("closed_at", todayStart.toISOString()),
  ]);

  // Settled-today count per item (closed tabs only)
  const todayTabIds = (todayTabs ?? []).map((t) => t.id);
  const soldMap: Record<string, number> = {};
  if (todayTabIds.length > 0) {
    const { data: soldItems } = await supabase
      .from("pos_tab_items")
      .select("pos_item_id, quantity")
      .in("tab_id", todayTabIds);
    for (const li of soldItems ?? []) {
      if (li.pos_item_id) soldMap[li.pos_item_id] = (soldMap[li.pos_item_id] ?? 0) + (li.quantity ?? 1);
    }
  }

  const allItems = (items ?? []) as Item[];
  const grouped: Record<string, Item[]> = {};
  for (const item of allItems) (grouped[resolveSection(item)] ??= []).push(item);

  const toTarget = (i: Item): StockTarget => ({
    id: i.id,
    name: i.name,
    bottleYield: i.bottle_yield,
    priceCents: i.price_cents,
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-1">Bar</p>
          <h1 className="font-display font-bold text-bone text-3xl">Inventory</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
          <p className="mt-3 text-sm text-bone/60">Add costed stock below, or correct counts directly in the table. Margin = (price − cost) ÷ price.</p>
        </div>
        <Link
          href="/admin/bar/items/new"
          className="shrink-0 bg-ochre text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-ochre/90 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {/* Add stock (with cost) — grouped so bottle-family items share one card */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">Add stock</h2>
        {SECTION_ORDER.filter((sec) => grouped[sec]?.some((i) => !i.bottle_parent_id)).map((sec) => {
          // Whole-bottle SKUs draw from their shot parent's pool, so no add row.
          const catItems = grouped[sec]!.filter((i) => !i.bottle_parent_id);
          const rendered = new Set<string>();
          return (
            <div key={sec} className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-bone/40">{SECTION_LABELS[sec] ?? sec}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {catItems.map((item) => {
                  if (rendered.has(item.id)) return null;
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
                        <AddStockForm action={addStock} targets={siblings.map(toTarget)} />
                      </div>
                    );
                  }
                  rendered.add(item.id);
                  return (
                    <div key={item.id} className="rounded-lg border border-bone/10 p-4 space-y-3">
                      <h3 className="text-bone font-medium">{item.name}</h3>
                      <AddStockForm action={addStock} targets={[toTarget(item)]} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Manage — cost, margin, set/remove, edit */}
      {SECTION_ORDER.filter((sec) => grouped[sec]?.length).map((sec) => (
        <section key={sec} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">
            {SECTION_LABELS[sec] ?? sec}
          </h2>
          <div className="border border-bone/10 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Item</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Cost</th>
                  <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Margin</th>
                  <th className="hidden md:table-cell text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Sold Today</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Set</th>
                  <th scope="col" className="sr-only px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {grouped[sec]!.map((item) => {
                  const settledToday = soldMap[item.id] ?? 0;
                  const stock = item.stock_quantity;
                  const threshold = item.reorder_level ?? 5;
                  const low = stock !== null && stock < threshold;
                  const isBottle = !!item.bottle_parent_id; // whole-bottle SKU: stock/cost derive from its shot parent
                  const margin = marginPct(item.price_cents, item.cost_cents);
                  return (
                    <tr key={item.id} className={`hover:bg-bone/3 transition-colors ${!item.is_active ? "opacity-40" : ""}`}>
                      <td className="px-4 py-3 text-bone font-medium">
                        {item.name}
                        {!item.is_active && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-bone/60 border border-bone/20 rounded px-1">off</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-right font-mono text-bone/60">{formatCents(item.price_cents)}</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {isBottle ? (
                          <span className="text-bone/40 text-xs">from shots</span>
                        ) : item.cost_cents == null ? (
                          <Link href={`/admin/bar/items/${item.id}/edit`} className="text-ochre/80 hover:text-ochre text-xs">set cost</Link>
                        ) : (
                          <span className="text-bone/60">{formatCents(item.cost_cents)}</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3 text-right font-mono">
                        {margin == null ? (
                          <span className="text-bone/40">—</span>
                        ) : (
                          <span className={margin < 0 ? "text-red-400" : "text-bone/60"}>{margin}%</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 text-right font-mono text-bone/60">
                        {settledToday > 0 ? settledToday : <span className="text-bone/60">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isBottle ? (
                          <span className="text-bone/40 text-xs">pooled</span>
                        ) : stock === null ? (
                          <span className="text-bone/60 font-mono">—</span>
                        ) : (
                          <span className={`font-mono font-bold ${low ? "text-red-400" : "text-bone"}`}>{stock}</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {isBottle ? (
                          <div className="text-right text-bone/30 text-xs pr-2">—</div>
                        ) : (
                        <form action={updateStock} className="flex gap-1.5 justify-end items-center">
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="number"
                            name="qty"
                            min="0"
                            defaultValue={stock ?? ""}
                            placeholder="—"
                            className="w-16 rounded border border-bone/20 bg-transparent text-bone text-xs text-right px-2 py-1 focus:outline-none focus:border-ochre/60"
                          />
                          <button
                            type="submit"
                            className="text-xs text-ochre hover:text-ochre/80 transition-colors px-2 py-1 border border-ochre/30 rounded hover:border-ochre/60"
                          >
                            Set
                          </button>
                        </form>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-3">
                          <Link
                            href={`/admin/bar/items/${item.id}/edit`}
                            className="text-xs text-bone/60 hover:text-bone transition-colors"
                          >
                            Edit
                          </Link>
                          <DeleteMenuItemButton id={item.id} name={item.name} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
