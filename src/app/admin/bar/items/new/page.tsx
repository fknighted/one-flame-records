import MenuItemForm from "@/components/MenuItemForm";
import { createMenuItem } from "../actions";

export default function NewMenuItemPage() {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <p className="text-[14px] mb-2">
          <a href="/admin/bar/items" className="studio-link inline-flex min-h-[44px] items-center">← Menu Items</a>
        </p>
        <h1 className="studio-page-title">New Menu Item</h1>
      </div>
      <MenuItemForm action={createMenuItem} mode="create" />
    </div>
  );
}
