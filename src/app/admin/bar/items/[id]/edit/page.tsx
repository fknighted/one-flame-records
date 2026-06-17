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
        <p className="text-xs text-bone/40 mb-1">
          <a href="/admin/bar/items" className="hover:text-bone transition-colors">← Menu Items</a>
        </p>
        <h1 className="font-display font-bold text-bone text-2xl">{item.name}</h1>
      </div>
      <MenuItemForm
        action={updateMenuItem}
        mode="edit"
        initialValues={{
          id:          item.id,
          name:        item.name,
          category:    item.category,
          price_cents: item.price_cents,
          description: item.description ?? "",
          sort_order:  item.sort_order ?? undefined,
          is_active:   item.is_active,
        }}
      />
    </div>
  );
}
