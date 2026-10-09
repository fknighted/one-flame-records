import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

// Allowlist: letters, digits, spaces, @, ., - and _ cover all realistic names/emails
const SAFE_SEARCH = /^[\w@.\-\s]{1,64}$/;

export default async function BarMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireBarStaff();

  const { q } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("gamer_members")
    .select("id, display_name, email, status, minutes_balance")
    .order("display_name");

  // Only apply search if input passes the allowlist — rejects PostgREST metacharacters
  const safeTerm = q?.trim() ?? "";
  if (safeTerm && SAFE_SEARCH.test(safeTerm)) {
    query = query.or(`display_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`);
  }

  const { data: members } = await query.limit(50);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="studio-page-title">Members</h1>
        <Link
          href="/bar/members/new"
          className="studio-btn studio-btn-primary"
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
          aria-label="Search members"
          className="studio-field flex-1 min-w-0"
        />
        <button
          type="submit"
          className="studio-btn studio-btn-secondary"
        >
          Search
        </button>
      </form>

      {/* List */}
      {!members?.length ? (
        <p className="text-muted text-[15px] text-center py-12">
          {q ? "No members found" : "No members yet"}
        </p>
      ) : (
        <div className="space-y-2">
          {members.map(m => (
            <Link
              key={m.id}
              href={`/bar/members/${m.id}`}
              className="studio-card studio-focus flex items-center gap-3 !py-3 min-h-[56px] hover:bg-raised"
            >
              <div className="flex-1 min-w-0">
                <p className="text-paper font-semibold text-[15px] [overflow-wrap:anywhere]">{m.display_name}</p>
                <p className="text-muted text-[13px] [overflow-wrap:anywhere]">{m.email}</p>
              </div>
              <span className={`studio-chip ${
                m.status === "active" ? "studio-chip-ok" : "studio-chip-bad"
              }`}>
                {m.status}
              </span>
              <span className="studio-count text-[20px] shrink-0">{m.minutes_balance}m</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
