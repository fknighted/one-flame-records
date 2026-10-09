import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import MenuItemForm from "@/components/MenuItemForm";
import { updateMenuItem } from "../../actions";

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: item } = await supabase.from("pos_items").select("*").eq("id", id).single();
  if (!item) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-[14px] mb-2">
          <a href="/admin/bar/items" className="studio-link inline-flex min-h-[44px] items-center">← Menu Items</a>
        </p>
        <h1 className="studio-page-title">{item.name}</h1>
      </div>
      <MenuItemForm
        action={updateMenuItem}
        mode="edit"
        initialValues={{
          id:            item.id,
          name:          item.name,
          category:      item.category,
          price_jmd:   item.price_jmd,
          cost_jmd:    item.cost_jmd,
          description:   item.description ?? "",
          sort_order:    item.sort_order ?? undefined,
          reorder_level: item.reorder_level ?? undefined,
          is_active:     item.is_active,
          bottle_group:  item.bottle_group,
          bottle_yield:  item.bottle_yield,
          menu_section:  item.menu_section,
        }}
      />
    </div>
  );
}
