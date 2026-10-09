import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import MenuGrid from "@/components/MenuGrid";
import TabControls from "./TabControls";
import QuantityControls from "./QuantityControls";
import { formatJmd } from "@/lib/bar/pos";
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
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <p className="text-[14px] mb-0.5">
            <a href="/bar" className="studio-link inline-flex min-h-[44px] items-center">← Tabs</a>
          </p>
          <h1 className="studio-page-title">{tab.name}</h1>
          {tab.notes && <p className="text-[13px] text-muted mt-1">{tab.notes}</p>}
          {!tab.regular_id && isOpen && <SaveAsRegularButton tabId={id} />}
        </div>
        <div className="text-right shrink-0">
          <p className="studio-money text-[32px]">{formatJmd(tab.total_jmd)}</p>
          {isAway ? (
            <span className="studio-chip studio-chip-neutral mt-1">
              Customer Left
            </span>
          ) : (
            <p className="mt-1">
              <span className={`studio-chip capitalize ${isOpen ? "studio-chip-ok" : "studio-chip-neutral"}`}>{tab.status}</span>
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout on larger screens; stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left: current tab items */}
        <div className="lg:w-2/5 flex flex-col">
          <h2 className="studio-label mb-2">
            Order ({tabItems?.length ?? 0} items)
          </h2>

          <div className="space-y-1.5">
            {!tabItems?.length ? (
              <p className="text-muted text-[15px] text-center py-8">No items yet — tap menu to add</p>
            ) : (
              tabItems.map(ti => (
                <TabItem key={ti.id} item={ti} tabId={id} isOpen={isOpen} />
              ))
            )}
          </div>

          {/* Tab controls */}
          {isActive && (
            <div className="pt-3 border-t border-line mt-3">
              <TabControls
                tabId={id}
                total={tab.total_jmd}
                tabName={tab.name}
                status={tab.status as "open" | "away"}
              />
            </div>
          )}
          {!isActive && (
            <div className="pt-3 border-t border-line mt-3">
              <p className="text-center text-[15px] text-muted capitalize">
                Tab {tab.status} · {tab.payment_method ?? "—"}
              </p>
            </div>
          )}
        </div>

        {/* Right: menu grid + custom item (only when tab is open, not away) */}
        {isOpen && items && (
          <div className="lg:flex-1 flex flex-col gap-3">
            <div>
              <h2 className="studio-label mb-2">
                Menu
              </h2>
              <div className="flex-1 min-h-0">
                <MenuGrid items={items} tabId={id} />
              </div>
            </div>
            <div className="shrink-0">
              <h2 className="studio-label mb-2">
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
  item: { id: string; name: string; price_jmd: number; quantity: number; note: string | null };
  tabId: string;
  isOpen: boolean;
}) {
  return (
    <div className="studio-card flex flex-wrap items-center gap-x-2 gap-y-1 !p-3">
      <div className="flex-1 min-w-[7rem]">
        <p className="text-paper text-[15px] font-semibold [overflow-wrap:anywhere]">{item.name}</p>
        {item.note && <p className="text-muted text-[13px]">{item.note}</p>}
      </div>
      <span className="studio-money text-[20px] shrink-0">{formatJmd(item.price_jmd * item.quantity)}</span>
      {isOpen && <QuantityControls tabItemId={item.id} tabId={tabId} quantity={item.quantity} />}
    </div>
  );
}
