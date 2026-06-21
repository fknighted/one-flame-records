import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/bar/pos";

export default async function BarInventoryPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  const { data: items } = await supabase
    .from("pos_items")
    .select("id, name, category, stock_quantity")
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name");

  const grouped: Record<string, NonNullable<typeof items>> = {};
  for (const item of items ?? []) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category]!.push(item);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-bone text-2xl">Inventory</h1>
        <p className="mt-1 text-sm text-bone/40">Current stock levels. Contact admin to update counts.</p>
      </div>

      {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((cat) => (
        <section key={cat} className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/40">
            {CATEGORY_LABELS[cat] ?? cat}
          </h2>
          <div className="border border-bone/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-bone/10">
                {grouped[cat]!.map((item) => {
                  const stock = item.stock_quantity;
                  const low   = stock !== null && stock <= 5;
                  const none  = stock !== null && stock === 0;
                  return (
                    <tr key={item.id} className={none ? "opacity-50" : ""}>
                      <td className="px-4 py-3 text-bone font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-right">
                        {stock === null ? (
                          <span className="text-bone/25 text-xs">not tracked</span>
                        ) : none ? (
                          <span className="text-red-400 font-bold text-sm">OUT</span>
                        ) : (
                          <span className={`font-mono font-bold text-sm ${low ? "text-red-400" : "text-bone"}`}>
                            {stock}
                          </span>
                        )}
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
