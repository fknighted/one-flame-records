import { redirect } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

function fmt(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
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
  if (member) {
    const { data } = await serviceClient
      .from("game_sessions")
      .select("id, started_at, station")
      .eq("member_id", member.id)
      .is("ended_at", null)
      .maybeSingle();
    activeSession = data ?? null;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-bone text-2xl">
        Welcome, {member?.display_name ?? "Gamer"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Balance */}
        <div className="border border-bone/15 rounded-2xl p-6">
          <p className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-2">
            Game Time Balance
          </p>
          <p className="text-4xl font-mono text-ochre font-semibold">
            {member ? fmt(member.minutes_balance) : "—"}
          </p>
          <p className="text-xs text-bone/30 mt-2">
            Ask a bartender to top up your balance
          </p>
        </div>

        {/* Active session */}
        <div className="border border-bone/15 rounded-2xl p-6">
          <p className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-2">
            Current Session
          </p>
          {activeSession ? (
            <>
              <p className="text-lg text-bone font-medium">Playing now</p>
              {activeSession.station && (
                <p className="text-sm text-bone/50 mt-1">{activeSession.station}</p>
              )}
            </>
          ) : (
            <p className="text-bone/30 text-sm">No active session</p>
          )}
        </div>
      </div>

      <Link href="/gamer/sessions" className="inline-block text-sm text-ochre hover:underline">
        View session history →
      </Link>
    </div>
  );
}
