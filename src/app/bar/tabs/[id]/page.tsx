import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import MenuGrid from "@/components/MenuGrid";
import TabControls from "./TabControls";
import QuantityControls from "./QuantityControls";
import { formatCents } from "@/lib/bar/pos";
import SaveAsRegularButton from "./SaveAsRegularButton";
import CustomItemForm from "./CustomItemForm";

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
  const isAway = tab.status === "away";
  const isActive = isOpen || isAway; // tab still needs payment

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto lg:max-w-none pb-16">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-xs text-bone/60 mb-0.5">
            <a href="/bar" className="hover:text-bone transition-colors">← Tabs</a>
          </p>
          <h1 className="font-display font-bold text-bone text-xl leading-tight">{tab.name}</h1>
          {tab.notes && <p className="text-xs text-bone/60 mt-0.5">{tab.notes}</p>}
          {!tab.regular_id && isOpen && <SaveAsRegularButton tabId={id} />}
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-ochre font-semibold">{formatCents(tab.total_cents)}</p>
          {isAway ? (
            <span className="inline-block text-xs font-semibold text-ochre bg-ochre/10 border border-ochre/20 rounded-full px-2 py-0.5">
              Customer Left
            </span>
          ) : (
            <p className="text-xs text-bone/60 capitalize">{tab.status}</p>
          )}
        </div>
      </div>

      {/* Two-column layout on larger screens; stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left: current tab items */}
        <div className="lg:w-2/5 flex flex-col">
          <h2 className="text-xs font-semibold text-bone/60 uppercase tracking-wider mb-2">
            Order ({tabItems?.length ?? 0} items)
          </h2>

          <div className="space-y-1.5">
            {!tabItems?.length ? (
              <p className="text-bone/60 text-sm text-center py-8">No items yet — tap menu to add</p>
            ) : (
              tabItems.map(ti => (
                <TabItem key={ti.id} item={ti} tabId={id} isOpen={isOpen} />
              ))
            )}
          </div>

          {/* Tab controls */}
          {isActive && (
            <div className="pt-3 border-t border-bone/10 mt-3">
              <TabControls
                tabId={id}
                total={tab.total_cents}
                tabName={tab.name}
                status={tab.status as "open" | "away"}
              />
            </div>
          )}
          {!isActive && (
            <div className="pt-3 border-t border-bone/10 mt-3">
              <p className="text-center text-sm text-bone/60 capitalize">
                Tab {tab.status} · {tab.payment_method ?? "—"}
              </p>
            </div>
          )}
        </div>

        {/* Right: menu grid + custom item (only when tab is open, not away) */}
        {isOpen && items && (
          <div className="lg:flex-1 flex flex-col gap-3">
            <div>
              <h2 className="text-xs font-semibold text-bone/60 uppercase tracking-wider mb-2">
                Menu
              </h2>
              <div className="flex-1 min-h-0">
                <MenuGrid items={items} tabId={id} />
              </div>
            </div>
            <div className="shrink-0">
              <h2 className="text-xs font-semibold text-bone/60 uppercase tracking-wider mb-2">
                Other / Custom
              </h2>
              <CustomItemForm tabId={id} />
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
        {item.note && <p className="text-bone/60 text-xs">{item.note}</p>}
      </div>
      <span className="text-ochre font-mono text-sm shrink-0">{formatCents(item.price_cents * item.quantity)}</span>
      {isOpen && <QuantityControls tabItemId={item.id} tabId={tabId} quantity={item.quantity} />}
    </div>
  );
}
