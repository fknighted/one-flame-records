import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";
import { formatJmd, CATEGORY_LABELS } from "@/lib/bar/pos";
import DeleteMenuItemButton from "./DeleteMenuItemButton";

const CATEGORIES = [
  { value: "all",       label: "All" },
  { value: "drink",     label: "Drinks" },
  { value: "beverage",  label: "Beverages" },
  { value: "food",      label: "Food" },
  { value: "snack",     label: "Snacks" },
  { value: "game_time", label: "Game Time" },
];

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="studio-label mb-1">Bar</p>
          <h1 className="studio-page-title">Menu Items</h1>
        </div>
        <Link href="/admin/bar/items/new" className="studio-btn studio-btn-primary">
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
              "studio-focus inline-flex min-h-[44px] items-center px-4 text-[14px] font-semibold",
              (cat ?? "all") === c.value
                ? "bg-raised text-paper border border-muted"
                : "text-muted border border-line hover:text-paper",
            ].join(" ")}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {!items?.length ? (
        <div className="studio-empty">
          <p className="studio-empty-body">
            No items yet.{" "}
            <Link href="/admin/bar/items/new" className="studio-link inline-flex min-h-[44px] items-center">
              Add your first menu item.
            </Link>
          </p>
        </div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[460px]">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th className="is-num">Price</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: Tables<"pos_items">) => (
                <tr key={item.id} className="is-link">
                  <td className="font-semibold [overflow-wrap:anywhere]">
                    {item.name}
                    {item.description && (
                      <p className="text-[13px] font-normal text-muted mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="text-muted">{CATEGORY_LABELS[item.category] ?? item.category}</td>
                  <td className="is-num">
                    <span className="studio-money">{formatJmd(item.price_jmd)}</span>
                  </td>
                  <td>
                    <span className={item.is_active ? "studio-chip studio-chip-ok" : "studio-chip studio-chip-neutral"}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="is-num whitespace-nowrap">
                    <Link
                      href={`/admin/bar/items/${item.id}/edit`}
                      className="studio-btn studio-btn-secondary studio-btn-sm mr-2"
                    >
                      Edit
                    </Link>
                    <DeleteMenuItemButton id={item.id} name={item.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
