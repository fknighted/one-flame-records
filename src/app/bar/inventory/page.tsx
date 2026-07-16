import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/bar/pos";
import InventoryAddRow, { type InvRow } from "@/components/InventoryAddRow";
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
  for (const item of allItems) (grouped[item.category] ??= []).push(item);

  const toRow = (i: Item): InvRow => ({
    id: i.id,
    name: i.name,
    stock: i.stock_quantity,
    threshold: i.reorder_level ?? 5,
    bottleYield: i.bottle_yield,
    priceCents: i.price_cents,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-bone text-2xl">Inventory</h1>
        <p className="mt-1 text-sm text-bone/60">Tap an item to add stock as you buy it. You can add but not remove — an admin adjusts counts. Low or out items show in red.</p>
      </div>

      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => {
        const catItems = grouped[cat]!;
        const rendered = new Set<string>();

        return (
          <section key={cat} className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="space-y-2">
              {catItems.map((item) => {
                if (rendered.has(item.id)) return null;

                // Bottle-family items (shared bottle_group) collapse into one row.
                if (item.bottle_group) {
                  const siblings = catItems.filter((i) => i.bottle_group === item.bottle_group);
                  siblings.forEach((s) => rendered.add(s.id));
                  const title = item.bottle_group.charAt(0).toUpperCase() + item.bottle_group.slice(1);
                  return (
                    <InventoryAddRow
                      key={item.bottle_group}
                      action={addStock}
                      title={title}
                      rows={siblings.map(toRow)}
                      isGroup
                    />
                  );
                }

                rendered.add(item.id);
                return (
                  <InventoryAddRow
                    key={item.id}
                    action={addStock}
                    title={item.name}
                    rows={[toRow(item)]}
                    isGroup={false}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
