import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { deleteMenuItem } from "./actions";
import type { Tables } from "@/types/supabase";
import { formatCents } from "@/lib/bar/pos";

const CATEGORIES = [
  { value: "all",       label: "All" },
  { value: "drink",     label: "Drinks" },
  { value: "beverage",  label: "Beverages" },
  { value: "food",      label: "Food" },
  { value: "snack",     label: "Snacks" },
  { value: "game_time", label: "Game Time" },
];

const CATEGORY_LABELS: Record<string, string> = {
  drink:     "Drink",
  beverage:  "Beverage",
  food:      "Food",
  game_time: "Game Time",
};

export default async function MenuItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase.from("pos_items").select("*").order("category").order("sort_order", { nullsFirst: false }).order("name");
  if (cat && cat !== "all") query = query.eq("category", cat);

  const { data: items } = await query;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
          <h1 className="font-display font-bold text-bone text-3xl">Menu Items</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <Link
          href="/admin/bar/items/new"
          className="bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
        >
          + Add Item
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={c.value === "all" ? "/admin/bar/items" : `/admin/bar/items?cat=${c.value}`}
            className={[
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              (cat ?? "all") === c.value
                ? "bg-ochre text-ink"
                : "bg-bone/10 text-bone/60 hover:bg-bone/20",
            ].join(" ")}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {!items?.length ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/30 text-sm">
          No items yet.{" "}
          <Link href="/admin/bar/items/new" className="text-ochre hover:underline">
            Add your first menu item.
          </Link>
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] text-sm">
            <thead className="border-b border-bone/10 bg-bone/3">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/10">
              {items.map((item: Tables<"pos_items">) => (
                <tr key={item.id} className="hover:bg-bone/3 transition-colors">
                  <td className="px-4 py-3 text-bone font-medium">
                    {item.name}
                    {item.description && (
                      <p className="text-xs text-bone/40 mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-bone/60">{CATEGORY_LABELS[item.category] ?? item.category}</td>
                  <td className="px-4 py-3 text-right text-bone font-mono">
                    {formatCents(item.price_cents)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={[
                      "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                      item.is_active ? "bg-forest/20 text-forest" : "bg-bone/10 text-bone/40",
                    ].join(" ")}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/bar/items/${item.id}/edit`}
                      className="text-xs text-bone/40 hover:text-bone transition-colors mr-4"
                    >
                      Edit
                    </Link>
                    <form action={deleteMenuItem.bind(null, item.id)} className="inline">
                      <button
                        type="submit"
                        className="text-xs text-oxblood/50 hover:text-oxblood transition-colors"
                        onClick={(e) => { if (!confirm(`Delete "${item.name}"?`)) e.preventDefault(); }}
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
