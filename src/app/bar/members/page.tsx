import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export default async function BarMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("gamer_members")
    .select("id, display_name, email, status, minutes_balance")
    .order("display_name");

  if (q) {
    // Strip PostgREST reserved chars before interpolating into .or() filter string
    const safe = q.replace(/[(),:*%]/g, "").slice(0, 100);
    if (safe) {
      query = query.or(`display_name.ilike.%${safe}%,email.ilike.%${safe}%`);
    }
  }

  const { data: members } = await query.limit(50);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-bone text-2xl">Members</h1>
        <Link
          href="/bar/members/new"
          className="bg-ochre text-ink text-sm font-semibold px-4 py-2 rounded-lg hover:bg-ochre/90 transition-colors"
        >
          + Invite Member
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          type="search"
          placeholder="Search by name or email…"
          className="flex-1 bg-bone/5 border border-bone/15 rounded-lg px-4 py-2.5 text-bone placeholder:text-bone/30 text-sm focus:outline-none focus:border-ochre/50"
        />
        <button
          type="submit"
          className="border border-bone/20 text-bone/60 hover:text-bone px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          Search
        </button>
      </form>

      {/* List */}
      {!members?.length ? (
        <p className="text-bone/30 text-sm text-center py-12">
          {q ? "No members found" : "No members yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <Link
              key={m.id}
              href={`/bar/members/${m.id}`}
              className="flex items-center gap-3 border border-bone/15 rounded-xl px-4 py-3 hover:border-ochre/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-bone font-medium text-sm">{m.display_name}</p>
                <p className="text-bone/40 text-xs">{m.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                m.status === "active" ? "bg-forest/20 text-forest" : "bg-red-900/30 text-red-400"
              }`}>
                {m.status}
              </span>
              <span className="text-bone/50 text-xs font-mono shrink-0">{m.minutes_balance}m</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
