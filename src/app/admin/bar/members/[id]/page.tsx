import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import MemberAdminActions from "./MemberAdminActions";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: member }, { data: sessions }, { data: transactions }] = await Promise.all([
    supabase.from("gamer_members").select("*").eq("id", id).single(),
    supabase.from("game_sessions").select("*").eq("member_id", id).order("started_at", { ascending: false }).limit(50),
    supabase.from("gamer_balance_transactions").select("*").eq("member_id", id).order("created_at", { ascending: false }).limit(50),
  ]);

  if (!member) notFound();

  const totalMinutes = (sessions ?? []).reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-xs text-bone/60 mb-1">
          <Link href="/admin/bar/members" className="hover:text-bone transition-colors">← Gamer Members</Link>
        </p>
        <h1 className="font-display font-bold text-bone text-2xl">{member.display_name}</h1>
        <p className="text-sm text-bone/50 mt-1">{member.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-bone/10 rounded-lg p-4">
          <p className="text-xs text-bone/60 mb-1">Balance</p>
          <p className="text-2xl font-display font-bold text-bone">{member.minutes_balance}<span className="text-sm text-bone/60 ml-1">min</span></p>
        </div>
        <div className="border border-bone/10 rounded-lg p-4">
          <p className="text-xs text-bone/60 mb-1">Sessions</p>
          <p className="text-2xl font-display font-bold text-bone">{sessions?.length ?? 0}</p>
        </div>
        <div className="border border-bone/10 rounded-lg p-4">
          <p className="text-xs text-bone/60 mb-1">Total Time</p>
          <p className="text-2xl font-display font-bold text-bone">{totalMinutes}<span className="text-sm text-bone/60 ml-1">min</span></p>
        </div>
      </div>

      <MemberAdminActions member={member} />

      {/* Session history */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/52">Session History</h2>
        {!sessions?.length ? (
          <p className="text-sm text-bone/50">No sessions yet.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg divide-y divide-bone/10">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-bone">{new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  {s.station && <p className="text-xs text-bone/60">{s.station}</p>}
                </div>
                <p className="text-bone/60 font-mono">
                  {s.duration_minutes != null ? `${s.duration_minutes} min` : "In progress"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Balance history */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/52">Balance History</h2>
        {!transactions?.length ? (
          <p className="text-sm text-bone/50">No transactions yet.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg divide-y divide-bone/10">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-bone capitalize">{t.type}</p>
                  {t.reason && <p className="text-xs text-bone/60">{t.reason}</p>}
                  <p className="text-xs text-bone/50">{new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <p className={`font-mono font-semibold text-sm ${t.amount_minutes > 0 ? "text-sage" : "text-rose"}`}>
                  {t.amount_minutes > 0 ? "+" : ""}{t.amount_minutes}m
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
