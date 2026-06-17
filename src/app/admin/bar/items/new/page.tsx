import MenuItemForm from "@/components/MenuItemForm";
import { createMenuItem } from "../actions";

export default function NewMenuItemPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-xs text-bone/40 mb-1">
          <a href="/admin/bar/items" className="hover:text-bone transition-colors">← Menu Items</a>
        </p>
        <h1 className="font-display font-bold text-bone text-2xl">New Menu Item</h1>
      </div>
      <MenuItemForm action={createMenuItem} mode="create" />
    </div>
  );
}
