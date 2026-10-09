"use client";

import { useActionState, useState } from "react";
import type { Database } from "@/types/supabase";
import { addItemToTab } from "@/app/bar/tabs/[id]/actions";
import { formatJmd, CATEGORY_ORDER, CATEGORY_LABELS, SECTION_ORDER, SECTION_LABELS, resolveSection } from "@/lib/bar/pos";

type PosItem = Database["public"]["Tables"]["pos_items"]["Row"];

type Props = {
  items: PosItem[];
  tabId: string;
};


function AddButton({ item, tabId, disabled, badge }: { item: PosItem; tabId: string; disabled: boolean; badge?: string }) {
  const [state, formAction, pending] = useActionState(addItemToTab, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="tab_id"  value={tabId} />
      <input type="hidden" name="item_id" value={item.id} />
      <button
        type="submit"
        disabled={pending || disabled}
        className={[
          "studio-focus w-full text-left border bg-panel p-3 min-h-[72px] flex flex-col justify-between",
          disabled
            ? "border-line opacity-60 cursor-not-allowed"
            : "border-muted hover:bg-raised disabled:opacity-60",
        ].join(" ")}
      >
        <span className="text-paper text-[15px] font-semibold leading-tight line-clamp-2">{item.name}</span>
        <div className="flex items-center justify-between mt-1">
          <span className="studio-money text-[22px]">{formatJmd(item.price_jmd)}</span>
          {badge && <span className={`studio-chip ${badge === "N/A" ? "studio-chip-neutral" : "studio-chip-bad"}`}>{badge}</span>}
        </div>
        {state?.error && (
          <span role="alert" className="studio-error text-[13px] mt-1 block">{state.error}</span>
        )}
      </button>
    </form>
  );
}

/**
 * Availability for the tab screen. Whole-bottle items (bottle_parent_id) draw
 * from their shot parent's pool: sellable only while MORE THAN one bottle's
 * worth of shots remains (parent stock > bottle_yield).
 */
function availability(item: PosItem, byId: Map<string, PosItem>): { disabled: boolean; badge?: string } {
  if (item.bottle_parent_id) {
    const parent = byId.get(item.bottle_parent_id);
    const yieldPer = parent?.bottle_yield ?? 0;
    if (!parent || yieldPer <= 0) return { disabled: true, badge: "N/A" };
    if (parent.stock_quantity === null) return { disabled: false };
    return parent.stock_quantity > yieldPer ? { disabled: false } : { disabled: true, badge: "Low" };
  }
  const out = item.stock_quantity !== null && item.stock_quantity <= 0;
  return { disabled: out, badge: out ? "Out" : undefined };
}

export default function MenuGrid({ items, tabId }: Props) {
  const availableCategories = CATEGORY_ORDER
    .filter(key => items.some(i => i.category === key && i.is_active))
    .map(key => ({ key, label: CATEGORY_LABELS[key] ?? key }));

  const [active, setActive] = useState(availableCategories[0]?.key ?? "drink");

  const byId = new Map(items.map(i => [i.id, i]));
  const visible = items.filter(i => i.category === active && i.is_active);

  // Cluster items within the active category tab by section (rums together,
  // beers together, …) without changing the category tabs themselves.
  const groups: Record<string, PosItem[]> = {};
  for (const item of visible) (groups[resolveSection(item)] ??= []).push(item);
  const sections = SECTION_ORDER.filter(s => groups[s]?.length);
  const showLabels = sections.length > 1;

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {availableCategories.map(c => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            aria-pressed={active === c.key}
            className={`studio-focus whitespace-nowrap min-h-[44px] px-4 text-[14px] font-semibold ${
              active === c.key
                ? "bg-raised text-paper border border-muted"
                : "text-muted border border-line hover:text-paper"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid, clustered by section within the tab */}
      <div className="flex-1 min-h-0 mt-3 overflow-y-auto space-y-4">
        {visible.length === 0 ? (
          <p className="text-center text-muted text-[15px] py-8">No items in this category</p>
        ) : (
          sections.map(sec => (
            <div key={sec} className="space-y-2">
              {showLabels && (
                <p className="studio-label">
                  {SECTION_LABELS[sec] ?? sec}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {groups[sec].map(item => {
                  const { disabled, badge } = availability(item, byId);
                  return <AddButton key={item.id} item={item} tabId={tabId} disabled={disabled} badge={badge} />;
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
