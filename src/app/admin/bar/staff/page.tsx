import InviteBartenderForm from "./InviteBartenderForm";
import PromoteBartenderForm from "./PromoteBartenderForm";
import RevokeBarAccessButton from "./RevokeBarAccessButton";
import DeactivateButton from "./DeactivateButton";
import { createServiceClient } from "@/lib/supabase/server";

export default async function BarStaffPage() {
  const supabase = createServiceClient();

  // Fetch both dedicated bartenders AND artists granted bar access
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, is_bartender, created_at")
    .or("role.eq.bartender,is_bartender.eq.true")
    .order("created_at");

  const staff = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(p.id);
      return {
        ...p,
        email: user?.email ?? "—",
        banned: !!user?.banned_until,
        isDualAccess: p.role !== "bartender" && p.is_bartender,
      };
    })
  );

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Bar Staff</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Staff list */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35">Current Bar Staff</h2>
        {!staff.length ? (
          <p className="text-sm text-bone/30">No bar staff yet. Invite or promote someone below.</p>
        ) : (
          <div className="border border-bone/10 rounded-lg divide-y divide-bone/10">
            {staff.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-bone">{b.email}</p>
                    {b.isDualAccess && (
                      <span className="text-[10px] bg-forest/20 text-forest px-1.5 py-0.5 rounded-full font-medium">
                        Artist + Bar
                      </span>
                    )}
                    {b.banned && (
                      <span className="text-[10px] bg-oxblood/20 text-oxblood px-1.5 py-0.5 rounded-full font-medium">
                        Deactivated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-bone/40 mt-0.5">
                    Added {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </div>

                {b.isDualAccess ? (
                  <RevokeBarAccessButton userId={b.id} email={b.email} />
                ) : !b.banned ? (
                  <DeactivateButton userId={b.id} email={b.email} />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promote an existing artist to bar access */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35 pb-2 border-b border-bone/10">
          Promote Existing Artist
        </h2>
        <p className="text-sm text-bone/40">
          Enter the email of an artist already in the system to grant them bar access.
          They keep their artist portal and gain access to the bar POS.
        </p>
        <PromoteBartenderForm />
      </section>

      {/* Invite a brand-new bartender */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-bone/35 pb-2 border-b border-bone/10">
          Invite New Bartender
        </h2>
        <InviteBartenderForm />
      </section>
    </div>
  );
}
