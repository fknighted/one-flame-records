import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

function fmt(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

export default async function BarOverviewPage() {
  const supabase = createServiceClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const [
    { data: openTabs },
    { data: todayTabs },
    { count: totalItems },
    { count: activeMembers },
    { count: activeSessions },
  ] = await Promise.all([
    supabase.from("pos_tabs").select("id, name, total_cents, created_at").eq("status", "open").order("created_at"),
    supabase.from("pos_tabs").select("total_cents").eq("status", "closed").gte("closed_at", todayIso),
    supabase.from("pos_items").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("gamer_members").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("game_sessions").select("id", { count: "exact", head: true }).is("ended_at", null),
  ]);

  const todayRevenue = (todayTabs ?? []).reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  const stats = [
    { label: "Open Tabs",        value: openTabs?.length ?? 0, href: "/bar" },
    { label: "Today's Revenue",  value: fmt(todayRevenue),     href: "/admin/bar/tabs" },
    { label: "Active Sessions",  value: activeSessions ?? 0,   href: "/bar/sessions" },
    { label: "Menu Items",       value: totalItems ?? 0,       href: "/admin/bar/items" },
    { label: "Gamer Members",    value: activeMembers ?? 0,    href: "/admin/bar/members" },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Overview</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-bone/10 rounded-lg p-4 hover:border-bone/25 transition-colors"
          >
            <p className="text-xs text-bone/40 mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-bone">{s.value}</p>
          </Link>
        ))}
      </div>

      {/* Open tabs list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35">Open Tabs</h2>
          <Link href="/bar/tabs/new" className="text-xs text-ochre hover:underline">+ New Tab</Link>
        </div>
        {!openTabs?.length ? (
          <p className="text-sm text-bone/30">No open tabs right now.</p>
        ) : (
          <div className="space-y-2">
            {openTabs.map((tab) => (
              <Link
                key={tab.id}
                href={`/bar/tabs/${tab.id}`}
                className="flex items-center justify-between border border-bone/10 rounded-lg px-4 py-3 hover:border-bone/25 transition-colors"
              >
                <span className="text-sm text-bone">{tab.name}</span>
                <span className="text-sm font-mono text-ochre">{fmt(tab.total_cents)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="flex flex-wrap gap-3">
        <Link href="/admin/bar/items" className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Manage Menu</Link>
        <Link href="/admin/bar/tabs" className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Order History</Link>
        <Link href="/admin/bar/members" className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Gamer Members</Link>
        <Link href="/admin/bar/staff" className="text-sm text-bone/50 hover:text-bone transition-colors border border-bone/15 rounded px-3 py-1.5">Bar Staff</Link>
      </section>
    </div>
  );
}
