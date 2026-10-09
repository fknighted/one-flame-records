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
        <p className="text-[14px] mb-2">
          <Link href="/bar/members" className="studio-link inline-flex min-h-[44px] items-center">← Members</Link>
        </p>
        <h1 className="studio-page-title">{member.display_name}</h1>
        <p className="text-[15px] text-muted mt-2 [overflow-wrap:anywhere]">{member.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="studio-stat">
          <p className="studio-stat-label">Balance</p>
          <p className="studio-stat-value">{fmt(member.minutes_balance)}</p>
        </div>
        <div className="studio-stat">
          <p className="studio-stat-label">Status</p>
          <p>
            <span className={`studio-chip ${member.status === "active" ? "studio-chip-ok" : "studio-chip-bad"}`}>
              {member.status}
            </span>
          </p>
        </div>
      </div>

      {/* Session history */}
      <section>
        <h2 className="studio-label mb-3">
          Recent Sessions
        </h2>
        {!sessions?.length ? (
          <p className="text-muted text-[15px]">No sessions yet</p>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="studio-card flex items-center gap-3 !py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-paper text-[15px]">
                    {new Date(s.started_at).toLocaleDateString("en-JM", { month: "short", day: "numeric" })}
                    {s.station && <span className="text-muted ml-2">· {s.station}</span>}
                  </p>
                </div>
                <span className="text-muted text-[14px] studio-figures">
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
          className="studio-link inline-flex min-h-[44px] items-center"
        >
          Manage in Admin →
        </Link>
      </div>
    </div>
  );
}
