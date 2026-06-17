import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

function fmt(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default async function BarMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBarStaff();
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: member }, { data: sessions }] = await Promise.all([
    supabase.from("gamer_members").select("*").eq("id", id).single(),
    supabase
      .from("game_sessions")
      .select("id, started_at, ended_at, duration_minutes, station")
      .eq("member_id", id)
      .order("started_at", { ascending: false })
      .limit(20),
  ]);

  if (!member) notFound();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <p className="text-xs text-bone/40 mb-1">
          <Link href="/bar/members" className="hover:text-bone transition-colors">← Members</Link>
        </p>
        <h1 className="font-display font-bold text-bone text-2xl">{member.display_name}</h1>
        <p className="text-sm text-bone/40">{member.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-bone/15 rounded-xl p-4 text-center">
          <p className="text-2xl font-mono text-ochre">{fmt(member.minutes_balance)}</p>
          <p className="text-xs text-bone/40 mt-1">Balance</p>
        </div>
        <div className="border border-bone/15 rounded-xl p-4 text-center">
          <p className={`text-lg font-semibold capitalize ${
            member.status === "active" ? "text-forest" : "text-red-400"
          }`}>{member.status}</p>
          <p className="text-xs text-bone/40 mt-1">Status</p>
        </div>
      </div>

      {/* Session history */}
      <section>
        <h2 className="text-xs font-semibold text-bone/40 uppercase tracking-wider mb-3">
          Recent Sessions
        </h2>
        {!sessions?.length ? (
          <p className="text-bone/30 text-sm">No sessions yet</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 border border-bone/10 rounded-lg px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-bone text-sm">
                    {new Date(s.started_at).toLocaleDateString("en-JM", { month: "short", day: "numeric" })}
                    {s.station && <span className="text-bone/40 ml-2">· {s.station}</span>}
                  </p>
                </div>
                <span className="text-bone/50 text-xs font-mono">
                  {s.duration_minutes ? fmt(s.duration_minutes) : "active"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="pt-2">
        <Link
          href={`/admin/bar/members/${member.id}`}
          className="text-sm text-ochre hover:underline"
        >
          Manage in Admin →
        </Link>
      </div>
    </div>
  );
}
