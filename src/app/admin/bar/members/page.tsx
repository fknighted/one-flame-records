import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminGamerMembersPage() {
  const supabase = createServiceClient();
  const { data: members } = await supabase
    .from("gamer_members")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="studio-label mb-1">Bar</p>
        <h1 className="studio-page-title">Gamer Members</h1>
      </div>

      {!members?.length ? (
        <div className="studio-empty">
          <p className="studio-empty-body">
            No members yet. Bartenders can create them from the{" "}
            <Link href="/bar/members" className="studio-link">bar POS</Link>.
          </p>
        </div>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[520px]">
            <thead>
              <tr>
                <th>Member</th>
                <th className="is-num">Balance (min)</th>
                <th>Status</th>
                <th>Joined</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="is-link">
                  <td className="[overflow-wrap:anywhere]">
                    <p className="font-semibold">{m.display_name}</p>
                    <p className="text-[13px] text-muted">{m.email}</p>
                  </td>
                  <td className="is-num"><span className="studio-count">{m.minutes_balance}</span></td>
                  <td>
                    <span className={m.status === "active" ? "studio-chip studio-chip-ok" : "studio-chip studio-chip-bad"}>
                      {m.status}
                    </span>
                  </td>
                  <td className="studio-figures text-muted">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="is-num">
                    <Link href={`/admin/bar/members/${m.id}`} className="studio-btn studio-btn-secondary studio-btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
