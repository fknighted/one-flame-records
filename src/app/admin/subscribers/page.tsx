import Link from "next/link";
import { requireAdmin, currentUserId } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import NewsletterForm from "./NewsletterForm";

export default async function SubscribersPage({searchParams}:{searchParams:Promise<{run?:string;new?:string}>}) {
  await requireAdmin();
  const params=await searchParams;
  const actor=await currentUserId();
  if(!actor)throw new Error("Not authenticated.");
  const supabase = createServiceClient();

  const [{ count: total }, { count: active }, { data: recent }] = await Promise.all([
    supabase.from("fan_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("fan_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("fan_subscribers").select("email, status, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  const {data:progress,error:progressError}=await supabase.rpc("newsletter_progress",{p_actor:actor});
  if(progressError)throw new Error("Could not load saved send progress. Please retry before starting a send.");
  const histories=(progress??[]).map(run=>({...run,id:run.run_id}));
  let selected=params.run?histories.find(run=>run.id===params.run):histories.find(run=>run.remaining>0||run.uncertain>0);
  if(params.run&&!selected){
    const older=await supabase.rpc("newsletter_progress",{p_actor:actor,p_run:params.run});
    if(older.error||!older.data?.[0])throw new Error("Saved newsletter not found.");
    selected={...older.data[0],id:older.data[0].run_id};
  }
  let initialRun;
  if(selected){
    const content=await supabase.from("newsletter_runs").select("subject,body").eq("id",selected.id).eq("created_by",actor).single();
    if(content.error||!content.data)throw new Error("Could not load this newsletter’s content.");
    initialRun={...selected,...content.data};
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <p className="studio-label mb-2">Community</p>
        <h1 className="studio-page-title">Subscribers</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {[
          { label: "Total subscribers", value: total ?? 0 },
          { label: "Active", value: active ?? 0 },
          { label: "Unsubscribed", value: (total ?? 0) - (active ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="studio-stat">
            <p className="studio-stat-label">{label}</p>
            <p className="studio-stat-value">{value}</p>
          </div>
        ))}
      </div>

      {/* Send newsletter */}
      <div>
        <h2 className="studio-section-title mb-4">Send Newsletter</h2>
        {histories.length>0&&<div className="studio-card space-y-2 mb-5"><h3 className="studio-label">Saved sends</h3>{histories.map(run=><p key={run.id}><Link className="studio-link" href={`/admin/subscribers?run=${run.id}`}>{run.subject}</Link> — {run.sent} accepted, {run.remaining} pending{run.uncertain?`, ${run.uncertain} need review`:""}</p>)}<Link className="studio-link" href="/admin/subscribers?new=1">Start a new newsletter after unfinished sends are resolved</Link></div>}
        <NewsletterForm key={selected?.id??"new"} activeCount={active ?? 0} initialRun={initialRun} />
      </div>

      {/* Recent subscribers */}
      {(recent ?? []).length > 0 && (
        <div>
          <h2 className="studio-section-title mb-4">Recent Subscribers</h2>
          <div className="studio-card p-0">
            {(recent ?? []).map((s, i) => (
              <div
                key={s.email}
                className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 ${i > 0 ? "border-t border-line" : ""}`}
              >
                <span className="text-paper min-w-0 [overflow-wrap:anywhere]">{s.email}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`studio-chip ${
                    s.status === "active" ? "studio-chip-ok" : "studio-chip-neutral"
                  }`}>
                    {s.status}
                  </span>
                  <span className="text-muted text-[15px]">{formatDate(s.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
