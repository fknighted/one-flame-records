import { redirect } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

function fmt(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default async function GamerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = createServiceClient();

  const { data: member } = await serviceClient
    .from("gamer_members")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  let activeSession: { id: string; started_at: string; station: string | null } | null = null;
  let recentTx: { type: string; amount_minutes: number; reason: string | null }[] | null = null;

  if (member) {
    const [{ data: sessionData }, { data: txData }] = await Promise.all([
      serviceClient
        .from("game_sessions")
        .select("id, started_at, station")
        .eq("member_id", member.id)
        .is("ended_at", null)
        .maybeSingle(),
      serviceClient
        .from("gamer_balance_transactions")
        .select("type, amount_minutes, reason")
        .eq("member_id", member.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    activeSession = sessionData ?? null;
    recentTx = txData ?? null;
  }

  return (
    <div className="space-y-6">
      <h1 className="studio-page-title">
        Welcome, {member?.display_name ?? "Gamer"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Balance */}
        <div className="studio-stat">
          <p className="studio-label">Game Time Balance</p>
          <p className="studio-stat-value text-[56px]">
            {member ? fmt(member.minutes_balance) : "—"}
          </p>
          <p className="text-[15px] text-muted">
            Ask a bartender to top up your balance
          </p>
        </div>

        {/* Active session */}
        <div className="studio-stat">
          <p className="studio-label">Current Session</p>
          {activeSession ? (
            <>
              <p className="studio-section-title">Playing now</p>
              {activeSession.station && (
                <p className="text-[15px] text-muted">{activeSession.station}</p>
              )}
            </>
          ) : (
            <p className="text-[16px] text-muted">No active session</p>
          )}
        </div>
      </div>

      <Link href="/gamer/sessions" className="studio-btn studio-btn-secondary w-full sm:w-auto">
        View session history
      </Link>

      {recentTx && recentTx.length > 0 && (
        <div className="studio-card">
          <h2 className="studio-label mb-4">Recent Transactions</h2>
          <div className="divide-y divide-line">
            {recentTx.map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[16px] text-paper capitalize">{t.type}</p>
                  {t.reason && <p className="text-[14px] text-muted [overflow-wrap:anywhere]">{t.reason}</p>}
                </div>
                <p className="studio-count shrink-0">
                  {t.amount_minutes > 0 ? "+" : ""}{t.amount_minutes}m
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
