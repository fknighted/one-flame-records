import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatJmd, marginPct, SECTION_LABELS, SECTION_ORDER, resolveSection, jamaicaMidnight } from "@/lib/bar/pos";
import { updateStock, addStock } from "./actions";
import DeleteMenuItemButton from "@/app/admin/bar/items/DeleteMenuItemButton";
import InventoryAddRow, { type InvRow } from "@/components/InventoryAddRow";

type Item = {
  id: string;
  name: string;
  category: string;
  price_jmd: number;
  cost_jmd: number | null;
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
      .select("id, name, category, price_jmd, cost_jmd, stock_quantity, reorder_level, is_active, bottle_group, bottle_yield, bottle_parent_id, menu_section")
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

  const toRow = (i: Item): InvRow => ({
    id: i.id,
    name: i.name,
    stock: i.stock_quantity,
    threshold: i.reorder_level ?? 5,
    bottleYield: i.bottle_yield,
    priceJmd: i.price_jmd,
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="studio-label mb-1">Bar</p>
          <h1 className="studio-page-title">Inventory</h1>
          <p className="mt-2 text-[15px] text-muted">Add costed stock below, or correct counts directly in the table. Margin = (price − cost) ÷ price.</p>
        </div>
        <Link href="/admin/bar/items/new" className="studio-btn studio-btn-primary shrink-0">
          + Add Item
        </Link>
      </div>

      {/* Add stock — click a line to expand its form (same as the bar POS list) */}
      <section className="space-y-3">
        <h2 className="studio-label">Add stock</h2>
        <p className="studio-hint -mt-1">Tap an item to open its add form.</p>
        {SECTION_ORDER.filter((sec) => grouped[sec]?.some((i) => !i.bottle_parent_id)).map((sec) => {
          // Whole-bottle SKUs draw from their shot parent's pool, so no add row.
          const catItems = grouped[sec]!.filter((i) => !i.bottle_parent_id);
          const rendered = new Set<string>();
          return (
            <div key={sec} className="space-y-2">
              <p className="studio-label">{SECTION_LABELS[sec] ?? sec}</p>
              <div className="space-y-2">
                {catItems.map((item) => {
                  if (rendered.has(item.id)) return null;
                  if (item.bottle_group) {
                    const siblings = catItems.filter((i) => i.bottle_group === item.bottle_group);
                    siblings.forEach((s) => rendered.add(s.id));
                    const title = item.bottle_group.charAt(0).toUpperCase() + item.bottle_group.slice(1);
                    return <InventoryAddRow key={item.bottle_group} action={addStock} title={title} rows={siblings.map(toRow)} isGroup />;
                  }
                  rendered.add(item.id);
                  return <InventoryAddRow key={item.id} action={addStock} title={item.name} rows={[toRow(item)]} isGroup={false} />;
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Manage — cost, margin, set/remove, edit */}
      {SECTION_ORDER.filter((sec) => grouped[sec]?.length).map((sec) => (
        <section key={sec} className="space-y-3">
          <h2 className="studio-label">
            {SECTION_LABELS[sec] ?? sec}
          </h2>
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[560px]">
              <thead>
                <tr>
                  <th>Item</th>
                  <th className="hidden sm:table-cell is-num">Price</th>
                  <th className="is-num">Cost</th>
                  <th className="hidden sm:table-cell is-num">Margin</th>
                  <th className="hidden md:table-cell is-num">Sold Today</th>
                  <th className="is-num">Stock</th>
                  <th className="is-num">Set</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {grouped[sec]!.map((item) => {
                  const settledToday = soldMap[item.id] ?? 0;
                  const stock = item.stock_quantity;
                  const threshold = item.reorder_level ?? 5;
                  const low = stock !== null && stock < threshold;
                  const isBottle = !!item.bottle_parent_id; // whole-bottle SKU: stock/cost derive from its shot parent
                  const margin = marginPct(item.price_jmd, item.cost_jmd);
                  return (
                    <tr key={item.id} className="is-link">
                      <td className={`font-semibold [overflow-wrap:anywhere] ${!item.is_active ? "text-muted" : ""}`}>
                        {item.name}
                        {!item.is_active && (
                          <span className="studio-chip studio-chip-neutral ml-2">off</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell is-num"><span className="studio-money text-[18px]">{formatJmd(item.price_jmd)}</span></td>
                      <td className="is-num">
                        {isBottle ? (
                          <span className="text-muted text-[13px]">from shots</span>
                        ) : item.cost_jmd == null ? (
                          <Link href={`/admin/bar/items/${item.id}/edit`} className="studio-link inline-flex min-h-[44px] items-center text-[14px]">set cost</Link>
                        ) : (
                          <span className="studio-money text-[18px]">{formatJmd(item.cost_jmd)}</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell is-num studio-figures">
                        {margin == null ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span>{margin}%</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell is-num studio-figures text-muted">
                        {settledToday > 0 ? settledToday : "—"}
                      </td>
                      <td className="is-num">
                        {isBottle ? (
                          <span className="text-muted text-[13px]">pooled</span>
                        ) : stock === null ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            {low && <span className="studio-chip studio-chip-bad">Low</span>}
                            <span className="studio-count">{stock}</span>
                          </span>
                        )}
                      </td>
                      <td>
                        {isBottle ? (
                          <div className="text-right text-muted text-[13px] pr-2">—</div>
                        ) : (
                        <form action={updateStock} className="flex gap-2 justify-end items-center">
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="number"
                            name="qty"
                            min="0"
                            defaultValue={stock ?? ""}
                            placeholder="—"
                            aria-label={`Stock count for ${item.name}`}
                            className="studio-field w-20 text-right"
                          />
                          <button
                            type="submit"
                            className="studio-btn studio-btn-secondary studio-btn-sm"
                          >
                            Set
                          </button>
                        </form>
                        )}
                      </td>
                      <td className="is-num">
                        <span className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/bar/items/${item.id}/edit`}
                            className="studio-btn studio-btn-secondary studio-btn-sm"
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
