import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { jamaicaMidnight, jamaicaTime, formatJmd } from "@/lib/bar/pos";
import StartSessionForm from "./StartSessionForm";
import EndSessionButton from "./EndSessionButton";
import SessionTimer from "./SessionTimer";

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
  ] = await Promise.all([
    supabase
      .from("game_sessions")
      .select("id, started_at, station, duration_type, price_jmd")
      .is("ended_at", null)
      .order("started_at"),
    supabase
      .from("game_sessions")
      .select("id, started_at, ended_at, duration_type, price_jmd, station")
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
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="studio-page-title">Game Sessions</h1>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="studio-stat">
          <p className="studio-stat-label">Today</p>
          <p className="studio-stat-value is-money text-[32px]">{formatJmd(todayRevenue)}</p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">This Week</p>
          <p className="studio-stat-value is-money text-[32px]">{formatJmd(weekRevenue)}</p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">This Month</p>
          <p className="studio-stat-value is-money text-[32px]">{formatJmd(monthRevenue)}</p>
        </div>
      </div>

      {/* Active sessions — live countdown timer */}
      <section>
        <h2 className="studio-label mb-3">
          Active ({activeSessions?.length ?? 0})
        </h2>

        {!activeSessions?.length ? (
          <div className="studio-empty">
            <p className="studio-empty-body">No active sessions</p>
          </div>
        ) : (
          <div className="space-y-3">
            <SessionTimer sessions={timerSessions} />
            {/* End session buttons — separate from timer so they can be server-rendered */}
            <div className="space-y-2">
              {activeSessions.map(s => (
                <div key={s.id} className="studio-card flex items-center gap-3 !py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-paper text-[14px] [overflow-wrap:anywhere]">
                      Drop-in
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="studio-label">
            Completed Today ({todaySessions?.length ?? 0})
          </h2>
          {todayRevenue > 0 && (
            <span className="studio-money">
              {formatJmd(todayRevenue)}
            </span>
          )}
        </div>

        {!todaySessions?.length ? (
          <div className="studio-empty">
            <p className="studio-empty-body">No sessions completed today</p>
          </div>
        ) : (
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[420px]">
              <thead>
                <tr>
                  <th>Station</th>
                  <th className="is-num">Start</th>
                  <th className="is-num">End</th>
                  <th className="is-num">Price</th>
                </tr>
              </thead>
              <tbody>
                {todaySessions.map(s => (
                  <tr key={s.id}>
                    <td className="text-muted">{s.station ?? "—"}</td>
                    <td className="is-num studio-figures text-muted">{jamaicaTime(s.started_at)}</td>
                    <td className="is-num studio-figures text-muted">{s.ended_at ? jamaicaTime(s.ended_at) : "—"}</td>
                    <td className="is-num">
                      {s.price_jmd ? <span className="studio-money">{formatJmd(s.price_jmd)}</span> : <span className="text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-[13px] font-semibold text-muted border-t border-line">Day Total</td>
                  <td className="is-num px-4 py-3 border-t border-line"><span className="studio-money">{formatJmd(todayRevenue)}</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Start session form */}
      <section>
        <h2 className="studio-label mb-3">
          Start Session
        </h2>
        <StartSessionForm />
      </section>
    </div>
  );
}
