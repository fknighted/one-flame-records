"use client";

import { useActionState, useState } from "react";
import type { Database } from "@/types/supabase";
import { addItemToTab } from "@/app/bar/tabs/[id]/actions";

type PosItem = Database["public"]["Tables"]["pos_items"]["Row"];

type Props = {
  items: PosItem[];
  tabId: string;
};

const CATEGORIES = [
  { key: "drink",     label: "Drinks" },
  { key: "beverage",  label: "Beverages" },
  { key: "food",      label: "Food" },
  { key: "game_time", label: "Game Time" },
] as const;

function fmt(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

function AddButton({ item, tabId }: { item: PosItem; tabId: string }) {
  const [state, formAction, pending] = useActionState(addItemToTab, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="tab_id"  value={tabId} />
      <input type="hidden" name="item_id" value={item.id} />
      <button
        type="submit"
        disabled={pending}
        className="w-full text-left border border-bone/15 rounded-xl p-3 min-h-[72px] flex flex-col justify-between hover:border-ochre/40 hover:bg-ochre/5 active:scale-[0.97] transition-all disabled:opacity-40"
      >
        <span className="text-bone text-sm font-medium leading-tight line-clamp-2">{item.name}</span>
        <span className="text-ochre text-sm font-mono font-semibold mt-1">{fmt(item.price_cents)}</span>
        {state?.error && (
          <span className="text-red-400 text-xs mt-1 block">{state.error}</span>
        )}
      </button>
    </form>
  );
}

export default function MenuGrid({ items, tabId }: Props) {
  const availableCategories = CATEGORIES.filter(c =>
    items.some(i => i.category === c.key && i.is_active)
  );

  const [active, setActive] = useState(availableCategories[0]?.key ?? "drink");

  const visible = items.filter(i => i.category === active && i.is_active);

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {availableCategories.map(c => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === c.key
                ? "bg-ochre text-ink"
                : "bg-bone/10 text-bone/60 hover:text-bone"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3 overflow-y-auto">
        {visible.length === 0 ? (
          <p className="col-span-2 text-center text-bone/30 text-sm py-8">No items in this category</p>
        ) : (
          visible.map(item => (
            <AddButton key={item.id} item={item} tabId={tabId} />
          ))
        )}
      </div>
    </div>
  );
}
