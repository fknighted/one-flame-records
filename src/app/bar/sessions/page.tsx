import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";
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

  const [{ data: activeSessions }, { data: members }] = await Promise.all([
    supabase
      .from("game_sessions")
      .select("id, started_at, station, member_id, gamer_members(display_name)")
      .is("ended_at", null)
      .order("started_at"),
    supabase
      .from("gamer_members")
      .select("id, display_name")
      .eq("status", "active")
      .order("display_name"),
  ]);

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
