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
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Gamer Members</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {!members?.length ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/30 text-sm">
          No members yet. Bartenders can create them from the{" "}
          <Link href="/bar/members" className="text-ochre hover:underline">bar POS</Link>.
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-bone/10 bg-bone/3">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Member</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Balance (min)</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/10">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-bone/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-bone font-medium">{m.display_name}</p>
                    <p className="text-xs text-bone/40">{m.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-bone">{m.minutes_balance}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={[
                      "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                      m.status === "active" ? "bg-forest/20 text-forest" : "bg-oxblood/20 text-oxblood",
                    ].join(" ")}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-bone/50">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/bar/members/${m.id}`} className="text-xs text-bone/40 hover:text-bone transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
