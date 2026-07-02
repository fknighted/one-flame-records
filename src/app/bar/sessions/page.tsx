import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { jamaicaMidnight, jamaicaTime, formatCents } from "@/lib/bar/pos";
import StartSessionForm from "./StartSessionForm";
import EndSessionButton from "./EndSessionButton";
import SessionTimer from "./SessionTimer";

function getName(m: { display_name: string } | { display_name: string }[] | null | undefined) {
  if (!m) return null;
  const r = Array.isArray(m) ? m[0] : m as { display_name: string };
  return r?.display_name ?? null;
}

export default async function SessionsPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  const todayStart = jamaicaMidnight();

  // Week start: last Monday Jamaica time (use UTC offset -5h)
  const weekStart = new Date(todayStart);
  const dayOfWeek = weekStart.getDay(); // 0=Sun, 1=Mon ...
  weekStart.setDate(weekStart.getDate() - ((dayOfWeek + 6) % 7));

  // Month start: 1st of current month in Jamaica time
  const monthStart = new Date(todayStart);
  monthStart.setDate(1);

  const [
    { data: activeSessions },
    { data: todaySessions },
    { data: weekSessions },
    { data: monthSessions },
    { data: members },
  ] = await Promise.all([
    supabase
      .from("game_sessions")
      .select("id, started_at, station, duration_type, price_jmd, member_id, gamer_members(display_name)")
      .is("ended_at", null)
      .order("started_at"),
    supabase
      .from("game_sessions")
      .select("id, started_at, ended_at, duration_type, price_jmd, station, gamer_members(display_name)")
      .not("ended_at", "is", null)
      .gte("ended_at", todayStart.toISOString())
      .order("ended_at", { ascending: false }),
    supabase
      .from("game_sessions")
      .select("price_jmd")
      .not("ended_at", "is", null)
      .gte("ended_at", weekStart.toISOString()),
    supabase
      .from("game_sessions")
      .select("price_jmd")
      .not("ended_at", "is", null)
      .gte("ended_at", monthStart.toISOString()),
    supabase
      .from("gamer_members")
      .select("id, display_name")
      .eq("status", "active")
      .order("display_name"),
  ]);

  const todayRevenue = (todaySessions ?? []).reduce((s, r) => s + (r.price_jmd ?? 0), 0);
  const weekRevenue  = (weekSessions  ?? []).reduce((s, r) => s + (r.price_jmd ?? 0), 0);
  const monthRevenue = (monthSessions ?? []).reduce((s, r) => s + (r.price_jmd ?? 0), 0);

  // Shape active sessions for the client-side timer
  const timerSessions = (activeSessions ?? []).map(s => ({
    id:            s.id,
    started_at:    s.started_at,
    station:       s.station,
    duration_type: s.duration_type,
    price_jmd:     s.price_jmd,
    member_name:   getName(s.gamer_members),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-bone text-2xl">Game Sessions</h1>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-bone/10 rounded-lg p-3">
          <p className="text-[10px] text-bone/60 uppercase tracking-wider mb-1">Today</p>
          <p className="text-xl font-display font-bold text-ochre">{formatCents(todayRevenue * 100)}</p>
        </div>
        <div className="border border-bone/10 rounded-lg p-3">
          <p className="text-[10px] text-bone/60 uppercase tracking-wider mb-1">This Week</p>
          <p className="text-xl font-display font-bold text-bone">{formatCents(weekRevenue * 100)}</p>
        </div>
        <div className="border border-bone/10 rounded-lg p-3">
          <p className="text-[10px] text-bone/60 uppercase tracking-wider mb-1">This Month</p>
          <p className="text-xl font-display font-bold text-bone">{formatCents(monthRevenue * 100)}</p>
        </div>
      </div>

      {/* Active sessions — live countdown timer */}
      <section>
        <h2 className="text-xs font-semibold text-bone/60 uppercase tracking-wider mb-3">
          Active ({activeSessions?.length ?? 0})
        </h2>

        {!activeSessions?.length ? (
          <div className="border border-bone/10 rounded-xl p-10 text-center text-bone/50 text-sm">
            No active sessions
          </div>
        ) : (
          <div className="space-y-3">
            <SessionTimer sessions={timerSessions} />
            {/* End session buttons — separate from timer so they can be server-rendered */}
            <div className="space-y-2">
              {activeSessions.map(s => (
                <div key={s.id} className="flex items-center gap-3 border border-bone/10 rounded-xl px-4 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-bone/70 text-xs">
                      {getName(s.gamer_members) ?? "Drop-in"}
                      {s.station && <span className="ml-1">· {s.station}</span>}
                    </p>
                  </div>
                  <EndSessionButton sessionId={s.id} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Today's completed sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-bone/60 uppercase tracking-wider">
            Completed Today ({todaySessions?.length ?? 0})
          </h2>
          {todayRevenue > 0 && (
            <span className="text-xs font-mono text-ochre font-semibold">
              {formatCents(todayRevenue * 100)}
            </span>
          )}
        </div>

        {!todaySessions?.length ? (
          <div className="border border-bone/10 rounded-xl p-6 text-center text-bone/50 text-sm">
            No sessions completed today
          </div>
        ) : (
          <div className="border border-bone/10 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Station</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Start</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">End</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/60">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {todaySessions.map(s => (
                  <tr key={s.id} className="hover:bg-bone/3 transition-colors">
                    <td className="px-4 py-3 text-bone font-medium">{getName(s.gamer_members) ?? <span className="text-bone/50">Drop-in</span>}</td>
                    <td className="px-4 py-3 text-bone/50">{s.station ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-bone/50 text-xs font-mono">{jamaicaTime(s.started_at)}</td>
                    <td className="px-4 py-3 text-right text-bone/50 text-xs font-mono">{s.ended_at ? jamaicaTime(s.ended_at) : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-ochre">
                      {s.price_jmd ? formatCents(s.price_jmd * 100) : <span className="text-bone/50">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-bone/10 bg-bone/3">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-bone/50">Day Total</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-bone">{formatCents(todayRevenue * 100)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Start session form */}
      <section>
        <h2 className="text-xs font-semibold text-bone/60 uppercase tracking-wider mb-3">
          Start Session
        </h2>
        <StartSessionForm members={members ?? []} />
      </section>
    </div>
  );
}
