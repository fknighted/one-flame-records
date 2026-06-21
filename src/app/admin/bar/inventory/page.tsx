import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCents, CATEGORY_LABELS, CATEGORY_ORDER, jamaicaMidnight } from "@/lib/bar/pos";
import { updateStock } from "./actions";

export default async function InventoryPage() {
  const supabase = createServiceClient();

  const todayStart = jamaicaMidnight();

  const [{ data: items }, { data: todayTabs }] = await Promise.all([
    supabase
      .from("pos_items")
      .select("id, name, category, price_cents, stock_quantity, is_active")
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
      if (li.pos_item_id) {
        soldMap[li.pos_item_id] = (soldMap[li.pos_item_id] ?? 0) + (li.quantity ?? 1);
      }
    }
  }

  // Group all items by category
  const grouped: Record<string, NonNullable<typeof items>> = {};
  for (const item of items ?? []) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category]!.push(item);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
          <h1 className="font-display font-bold text-bone text-3xl">Inventory</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
          <p className="mt-3 text-sm text-bone/40">Set stock counts and manage menu items. Items at 5 or below highlight in red.</p>
        </div>
        <Link
          href="/admin/bar/items/new"
          className="shrink-0 bg-ochre text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-ochre/90 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40">
            {CATEGORY_LABELS[cat] ?? cat}
          </h2>
          <div className="border border-bone/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Item</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Price</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Settled Today</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Set Stock</th>
                  <th scope="col" className="sr-only px-4 py-3">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {grouped[cat]!.map((item) => {
                  const settledToday = soldMap[item.id] ?? 0;
                  const stock = item.stock_quantity;
                  const low = stock !== null && stock <= 5;
                  return (
                    <tr key={item.id} className={`hover:bg-bone/3 transition-colors ${!item.is_active ? "opacity-40" : ""}`}>
                      <td className="px-4 py-3 text-bone font-medium">
                        {item.name}
                        {!item.is_active && (
                          <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-bone/40 border border-bone/20 rounded px-1">off</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-bone/60">{formatCents(item.price_cents)}</td>
                      <td className="px-4 py-3 text-right font-mono text-bone/60">
                        {settledToday > 0 ? settledToday : <span className="text-bone/25">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {stock === null ? (
                          <span className="text-bone/25 font-mono">—</span>
                        ) : (
                          <span className={`font-mono font-bold ${low ? "text-red-400" : "text-bone"}`}>
                            {stock}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
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
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/bar/items/${item.id}/edit`}
                          className="text-xs text-bone/40 hover:text-bone transition-colors"
                        >
                          Edit
                        </Link>
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
