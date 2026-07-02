import { createServiceClient } from "@/lib/supabase/server";
import NewsletterForm from "./NewsletterForm";

export default async function SubscribersPage() {
  const supabase = createServiceClient();

  const [{ count: total }, { count: active }, { data: recent }] = await Promise.all([
    supabase.from("fan_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("fan_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("fan_subscribers").select("email, status, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-2">Community</p>
        <h1 className="font-display font-bold text-bone text-3xl">Subscribers</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total subscribers", value: total ?? 0 },
          { label: "Active", value: active ?? 0 },
          { label: "Unsubscribed", value: (total ?? 0) - (active ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-bone/10 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/52 mb-1">{label}</p>
            <p className="font-display font-bold text-bone text-2xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Send newsletter */}
      <div>
        <h2 className="font-display font-bold text-bone text-xl mb-4">Send Newsletter</h2>
        <NewsletterForm activeCount={active ?? 0} />
      </div>

      {/* Recent subscribers */}
      {(recent ?? []).length > 0 && (
        <div>
          <h2 className="font-display font-bold text-bone text-xl mb-4">Recent Subscribers</h2>
          <div className="rounded-lg border border-bone/10 overflow-hidden">
            {(recent ?? []).map((s, i) => (
              <div
                key={s.email}
                className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? "border-t border-bone/8" : ""}`}
              >
                <span className="text-bone/80 font-mono text-xs">{s.email}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    s.status === "active" ? "bg-forest/15 text-sage" : "bg-bone/10 text-bone/60"
                  }`}>
                    {s.status}
                  </span>
                  <span className="text-bone/50 text-xs">{formatDate(s.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
