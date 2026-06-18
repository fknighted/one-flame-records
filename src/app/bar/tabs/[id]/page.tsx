import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import MenuGrid from "@/components/MenuGrid";
import TabControls from "./TabControls";
import RemoveItemButton from "./RemoveItemButton";

function fmt(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

export default async function TabPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBarStaff();
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: tab }, { data: items }, { data: tabItems }] = await Promise.all([
    supabase.from("pos_tabs").select("*").eq("id", id).single(),
    supabase.from("pos_items").select("*").eq("is_active", true).order("sort_order").order("name"),
    supabase.from("pos_tab_items").select("*").eq("tab_id", id).order("created_at"),
  ]);

  if (!tab) notFound();

  const isOpen = tab.status === "open";

  return (
    <div className="flex flex-col h-[calc(100dvh-6rem)] sm:h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-9rem)] gap-4 max-w-2xl mx-auto lg:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs text-bone/40 mb-0.5">
            <a href="/bar" className="hover:text-bone transition-colors">← Tabs</a>
          </p>
          <h1 className="font-display font-bold text-bone text-xl leading-tight">{tab.name}</h1>
          {tab.notes && <p className="text-xs text-bone/40 mt-0.5">{tab.notes}</p>}
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-ochre font-semibold">{fmt(tab.total_cents)}</p>
          <p className="text-xs text-bone/40 capitalize">{tab.status}</p>
        </div>
      </div>

      {/* Two-column layout on larger screens; stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">

        {/* Left: current tab items */}
        <div className="lg:w-2/5 flex flex-col min-h-0">
          <h2 className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-2 shrink-0">
            Order ({tabItems?.length ?? 0} items)
          </h2>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
            {!tabItems?.length ? (
              <p className="text-bone/25 text-sm text-center py-8">No items yet — tap menu to add</p>
            ) : (
              tabItems.map(ti => (
                <TabItem key={ti.id} item={ti} tabId={id} isOpen={isOpen} />
              ))
            )}
          </div>

          {/* Close tab controls */}
          {isOpen && (
            <div className="shrink-0 pt-3 border-t border-bone/10 mt-3">
              <TabControls tabId={id} total={tab.total_cents} />
            </div>
          )}
          {!isOpen && (
            <div className="shrink-0 pt-3 border-t border-bone/10 mt-3">
              <p className="text-center text-sm text-bone/40 capitalize">
                Tab {tab.status} · {tab.payment_method ?? "—"}
              </p>
            </div>
          )}
        </div>

        {/* Right: menu grid (only when tab is open) */}
        {isOpen && items && (
          <div className="lg:flex-1 min-h-0 flex flex-col">
            <h2 className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-2 shrink-0">
              Menu
            </h2>
            <div className="flex-1 min-h-0">
              <MenuGrid items={items} tabId={id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabItem({
  item,
  tabId,
  isOpen,
}: {
  item: { id: string; name: string; price_cents: number; quantity: number; note: string | null };
  tabId: string;
  isOpen: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border border-bone/10 rounded-lg px-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-bone text-sm font-medium truncate">{item.name}</p>
        {item.note && <p className="text-bone/40 text-xs">{item.note}</p>}
      </div>
      <span className="text-bone/50 text-xs shrink-0">×{item.quantity}</span>
      <span className="text-ochre font-mono text-sm shrink-0">{fmt(item.price_cents * item.quantity)}</span>
      {isOpen && <RemoveItemButton tabItemId={item.id} tabId={tabId} />}
    </div>
  );
}
