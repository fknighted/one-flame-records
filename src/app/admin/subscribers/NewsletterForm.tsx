"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef } from "react";
import { sendNewsletter, type NewsletterState } from "./actions";

const INPUT = "studio-field";
const LABEL = "studio-field-label";

export default function NewsletterForm({ activeCount, initialRun }: { activeCount: number; initialRun?:{id:string;subject:string;body:string;sent:number;remaining:number;uncertain:number} }) {
  const router=useRouter();
  const run=useRef<string|null>(initialRun?.id??null);
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(async(previous,data)=>{
    run.current??=crypto.randomUUID(); data.set("run_id",run.current);
    const result=await sendNewsletter(previous,data);
    if(result?.runId)router.replace(`/admin/subscribers?run=${result.runId}`,{scroll:false});
    return result;
  }, initialRun?{runId:initialRun.id,sent:initialRun.sent,remaining:initialRun.remaining,uncertain:initialRun.uncertain}:null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <p role="alert" className="studio-error">{state.error}</p>
      )}
      {state?.sent != null && !state.error && (
        <p className="studio-success">
          Accepted by the email provider for {state.sent} subscriber{state.sent !== 1 ? "s" : ""}.
        </p>
      )}

      {state?.remaining ? <p role="status">{state.remaining} messages remain. Continue this send to finish; messages awaiting a provider response may take ten minutes before retry.</p> : null}
      {state?.uncertain ? <p role="alert" className="studio-error">Some delivery results need review. Check the provider before sending them again.</p> : null}
      {state?.runId && !state.remaining && !state.uncertain ? <button type="button" className="studio-btn studio-btn-secondary" onClick={()=>router.push("/admin/subscribers?new=1")}>Start a new newsletter</button> : null}
      <div>
        <label htmlFor="newsletter-subject" className={LABEL}>Subject *</label>
        <input id="newsletter-subject" name="subject" defaultValue={initialRun?.subject} readOnly={!!state?.runId} type="text" required placeholder="One Flame Records — New Release" className={INPUT} />
      </div>

      <div>
        <label htmlFor="newsletter-body" className={LABEL}>Body (Markdown) *</label>
        <textarea
          id="newsletter-body"
          defaultValue={initialRun?.body}
          name="body"
          readOnly={!!state?.runId}
          required
          rows={10}
          placeholder="Write your newsletter in Markdown…"
          className={`${INPUT} leading-relaxed`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending || activeCount === 0 || (!!state?.runId && !state.remaining)}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Sending…" : state?.runId ? "Continue this send" : `Send to ${activeCount} subscriber${activeCount !== 1 ? "s" : ""}`}
        </button>
        {activeCount === 0 && (
          <p className="studio-hint">No active subscribers yet.</p>
        )}
      </div>
    </form>
  );
}
