import InviteBartenderForm from "./InviteBartenderForm";
import { createServiceClient } from "@/lib/supabase/server";

export default async function BarStaffPage() {
  const supabase = createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, created_at")
    .eq("role", "bartender")
    .order("created_at");

  // Fetch auth user emails in parallel
  const bartenders = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(p.id);
      return { ...p, email: user?.email ?? "—", banned: !!user?.banned_until };
    })
  );

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Bar Staff</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Existing bartenders */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35">Current Bartenders</h2>
        {!bartenders.length ? (
          <p className="text-sm text-bone/30">No bartenders yet. Invite one below.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg divide-y divide-bone/10">
            {bartenders.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-bone">{b.email}</p>
                  <p className="text-xs text-bone/40 mt-0.5">
                    Added {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>
                {b.banned && (
                  <span className="text-xs bg-oxblood/20 text-oxblood px-2 py-0.5 rounded-full">Deactivated</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invite new bartender */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35 pb-2 border-b border-bone/10">
          Invite New Bartender
        </h2>
        <InviteBartenderForm />
      </section>
    </div>
  );
}
