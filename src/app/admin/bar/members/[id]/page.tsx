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
        <p className="text-[14px] mb-2">
          <Link href="/admin/bar/members" className="studio-link inline-flex min-h-[44px] items-center">← Gamer Members</Link>
        </p>
        <h1 className="studio-page-title">{member.display_name}</h1>
        <p className="text-[15px] text-muted mt-2 [overflow-wrap:anywhere]">{member.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="studio-stat">
          <p className="studio-stat-label">Balance</p>
          <p className="studio-stat-value">{member.minutes_balance}<span className="text-[14px] font-normal text-muted ml-1 font-text">min</span></p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">Sessions</p>
          <p className="studio-stat-value">{sessions?.length ?? 0}</p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">Total Time</p>
          <p className="studio-stat-value">{totalMinutes}<span className="text-[14px] font-normal text-muted ml-1 font-text">min</span></p>
        </div>
      </div>

      <MemberAdminActions member={member} />

      {/* Session history */}
      <section className="space-y-3">
        <h2 className="studio-label">Session History</h2>
        {!sessions?.length ? (
          <p className="text-[15px] text-muted">No sessions yet.</p>
        ) : (
          <div className="studio-card p-0 divide-y divide-line">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
                <div>
                  <p className="text-paper">{new Date(s.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  {s.station && <p className="text-[13px] text-muted">{s.station}</p>}
                </div>
                <p className="text-muted studio-figures">
                  {s.duration_minutes != null ? `${s.duration_minutes} min` : "In progress"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Balance history */}
      <section className="space-y-3">
        <h2 className="studio-label">Balance History</h2>
        {!transactions?.length ? (
          <p className="text-[15px] text-muted">No transactions yet.</p>
        ) : (
          <div className="studio-card p-0 divide-y divide-line">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
                <div>
                  <p className="text-paper capitalize">{t.type}</p>
                  {t.reason && <p className="text-[13px] text-muted">{t.reason}</p>}
                  <p className="text-[13px] text-muted">{new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <p className="studio-count">
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
