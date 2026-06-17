import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

function fmt(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

function elapsed(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default async function BarDashboardPage() {
  await requireBarStaff();
  const supabase = createServiceClient();
  const { data: openTabs } = await supabase
    .from("pos_tabs")
    .select("id, name, total_cents, created_at, notes")
    .eq("status", "open")
    .order("created_at");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-bone text-2xl">Active Tabs</h1>
        <Link
          href="/bar/tabs/new"
          className="bg-ochre text-ink text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-ochre/90 transition-colors"
        >
          + Open Tab
        </Link>
      </div>

      {!openTabs?.length ? (
        <div className="border border-bone/10 rounded-xl p-12 text-center text-bone/30">
          <p className="text-lg mb-2">No open tabs</p>
          <Link href="/bar/tabs/new" className="text-sm text-ochre hover:underline">Open the first one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {openTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/bar/tabs/${tab.id}`}
              className="border border-bone/15 rounded-xl p-4 hover:border-ochre/40 hover:bg-bone/3 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-display font-bold text-bone text-lg leading-tight">{tab.name}</h2>
                <span className="text-xs text-bone/40 mt-1">{elapsed(tab.created_at)}</span>
              </div>
              {tab.notes && <p className="text-xs text-bone/40 mb-3">{tab.notes}</p>}
              <p className="text-2xl font-mono text-ochre">{fmt(tab.total_cents)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
