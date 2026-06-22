import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
import { jamaicaMidnight, jamaicaTime } from "@/lib/bar/pos";
import StartSessionForm from "./StartSessionForm";
import EndSessionButton from "./EndSessionButton";

function elapsed(startedAt: string): string {
  const ms   = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default async function SessionsPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  const [{ data: activeSessions }, { data: todaySessions }, { data: members }] = await Promise.all([
    supabase
      .from("game_sessions")
      .select("id, started_at, station, member_id, gamer_members(display_name)")
      .is("ended_at", null)
      .order("started_at"),
    supabase
      .from("game_sessions")
      .select("id, started_at, ended_at, duration_minutes, station, gamer_members(display_name)")
      .not("ended_at", "is", null)
      .gte("started_at", jamaicaMidnight().toISOString())
      .order("ended_at", { ascending: false }),
    supabase
      .from("gamer_members")
      .select("id, display_name")
      .eq("status", "active")
      .order("display_name"),
  ]);

  const totalMinutesToday = (todaySessions ?? []).reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-bone text-2xl">Game Sessions</h1>
      </div>

      {/* Active sessions */}
      <section>
        <h2 className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-3">
          Active ({activeSessions?.length ?? 0})
        </h2>

        {!activeSessions?.length ? (
          <div className="border border-bone/10 rounded-xl p-10 text-center text-bone/30 text-sm">
            No active sessions
          </div>
        ) : (
          <div className="space-y-2">
            {activeSessions.map(s => {
              const memberName = Array.isArray(s.gamer_members)
                ? s.gamer_members[0]?.display_name
                : (s.gamer_members as { display_name: string } | null)?.display_name;
              return (
                <div key={s.id} className="flex items-center gap-3 border border-bone/15 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-bone font-medium text-sm">
                      {memberName ?? "Drop-in"}
                      {s.station && <span className="text-bone/40 ml-2 font-normal">· {s.station}</span>}
                    </p>
                    <p className="text-bone/40 text-xs">{elapsed(s.started_at)} elapsed</p>
                  </div>
                  <EndSessionButton sessionId={s.id} />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Today's ended sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-bone/40 uppercase tracking-wider">
            Today&apos;s Sessions ({todaySessions?.length ?? 0})
          </h2>
          {totalMinutesToday > 0 && (
            <span className="text-xs font-mono text-bone/50">
              {totalMinutesToday} min total
            </span>
          )}
        </div>

        {!todaySessions?.length ? (
          <div className="border border-bone/10 rounded-xl p-6 text-center text-bone/30 text-sm">
            No sessions ended today
          </div>
        ) : (
          <div className="border border-bone/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-sm">
              <thead className="border-b border-bone/10 bg-bone/3">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Station</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Start</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">End</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Min</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone/10">
                {todaySessions.map(s => {
                  const memberName = Array.isArray(s.gamer_members)
                    ? s.gamer_members[0]?.display_name
                    : (s.gamer_members as { display_name: string } | null)?.display_name;
                  return (
                    <tr key={s.id} className="hover:bg-bone/3 transition-colors">
                      <td className="px-4 py-3 text-bone font-medium">{memberName ?? <span className="text-bone/30">Drop-in</span>}</td>
                      <td className="px-4 py-3 text-bone/50">{s.station ?? "—"}</td>
                      <td className="px-4 py-3 text-right text-bone/50 text-xs font-mono">{jamaicaTime(s.started_at)}</td>
                      <td className="px-4 py-3 text-right text-bone/50 text-xs font-mono">{s.ended_at ? jamaicaTime(s.ended_at) : "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-bone">{s.duration_minutes ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-bone/10 bg-bone/3">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-bone/50">Day Total</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-bone">{totalMinutesToday} min</td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
        )}
      </section>

      {/* Start session form */}
      <section>
        <h2 className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-3">
          Start Session
        </h2>
        <StartSessionForm members={members ?? []} />
      </section>
    </div>
  );
}
