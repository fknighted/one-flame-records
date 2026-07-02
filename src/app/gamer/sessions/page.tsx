import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

function fmt(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default async function GamerSessionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = createServiceClient();

  const { data: member } = await serviceClient
    .from("gamer_members")
    .select("id, display_name")
    .eq("auth_user_id", user.id)
    .single();

  const { data: sessions } = member
    ? await serviceClient
        .from("game_sessions")
        .select("id, started_at, ended_at, duration_minutes, station")
        .eq("member_id", member.id)
        .order("started_at", { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-bone text-2xl">Session History</h1>

      {!sessions?.length ? (
        <p className="text-bone/50 text-sm">No sessions yet — visit the Flames Lounge to play!</p>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 border border-bone/10 rounded-xl px-4 py-3">
              <div className="flex-1">
                <p className="text-bone text-sm">
                  {new Date(s.started_at).toLocaleDateString("en-JM", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-bone/60 text-xs mt-0.5">
                  {new Date(s.started_at).toLocaleTimeString("en-JM", { hour: "2-digit", minute: "2-digit" })}
                  {s.station ? ` · ${s.station}` : ""}
                </p>
              </div>
              <span className={`text-sm font-mono ${s.ended_at ? "text-bone/60" : "text-ochre"}`}>
                {s.duration_minutes ? fmt(s.duration_minutes) : "active"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
