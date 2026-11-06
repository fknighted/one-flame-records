'use client';
import { useRouter } from 'next/navigation';
import { useActionState, useRef, useState } from 'react';
import { sendNewsletter, previewNewsletter, testNewsletter, type NewsletterState } from './actions';
export default function NewsletterForm({activeCount,initialRun}:{activeCount:number;initialRun?:{id:string;subject:string;body:string;sent:number;remaining:number;uncertain:number}}){
 const router=useRouter();const run=useRef<string|null>(initialRun?.id??null);
 const [subject,setSubject]=useState(initialRun?.subject??'');const [body,setBody]=useState(initialRun?.body??'');
 const [review,setReview]=useState<{html:string;token:string;subject:string;body:string}|null>(null);const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const [attempt,setAttempt]=useState<{id:string;subject:string;body:string}|null>(null);
 const [state,formAction,pending]=useActionState<NewsletterState,FormData>(async(previous,data)=>{
  run.current??=crypto.randomUUID();data.set('run_id',run.current);
  try{const result=await sendNewsletter(previous,data);if(result?.runId)router.replace(`/admin/subscribers?run=${result.runId}`,{scroll:false});return result;}catch{return {error:'Send response interrupted. Continue this same send to avoid duplicates.',runId:run.current,remaining:previous?.remaining??activeCount};}
 },initialRun?{runId:initialRun.id,sent:initialRun.sent,remaining:initialRun.remaining,uncertain:initialRun.uncertain}:null);
 const locked=!!state?.runId;const working=busy||pending;
 const current=review?.subject===subject&&review?.body===body;
 async function preview(){setBusy(true);setError('');try{const result=await previewNewsletter(subject,body);if(result.error)setError(result.error);else if(result.html&&result.token){setReview({html:result.html,token:result.token,subject,body});setConfirmed(false);}}catch{setError('Preview unavailable. Your draft is still here.');}finally{setBusy(false);}}
 async function test(){const next=attempt??{id:crypto.randomUUID(),subject,body};setAttempt(next);setBusy(true);setError('');setNotice('');try{const result=await testNewsletter(next.subject,next.body,next.id);if(result.error)setError(result.error);else{setNotice(result.message??'Test accepted.');setAttempt(null);}}catch{setError('Test response interrupted. Retry this same test.');}finally{setBusy(false);}}
 return <form action={formAction} className="space-y-5">
  {(error||state?.error)&&<p role="alert" className="studio-error">{error||state?.error}</p>}{notice&&<p role="status" className="studio-success">{notice}</p>}
  {state?.sent!=null&&<p role="status" className="studio-success">Accepted by the email provider for {state.sent} subscribers. Inbox delivery is not confirmed.</p>}
  {!!state?.remaining&&<p role="status">{state.remaining} messages remain. Continue this same send; interrupted responses may need ten minutes before retry.</p>}
  {!!state?.uncertain&&<p role="alert" className="studio-error">Some results need review. Check the provider before sending them again.</p>}
  {locked&&!state?.remaining&&!state?.uncertain&&<button type="button" className="studio-btn studio-btn-secondary" onClick={()=>router.push('/admin/subscribers?new=1')}>Start a new newsletter</button>}
  <div><label htmlFor="newsletter-subject" className="studio-field-label">Subject *</label><input id="newsletter-subject" name="subject" className="studio-field" required maxLength={200} value={subject} readOnly={locked||working||!!attempt} onChange={e=>{setSubject(e.target.value);setConfirmed(false);}}/></div>
  <div><label htmlFor="newsletter-body" className="studio-field-label">Message (Markdown) *</label><textarea id="newsletter-body" name="body" className="studio-field" rows={10} required maxLength={50000} value={body} readOnly={locked||working||!!attempt} onChange={e=>{setBody(e.target.value);setConfirmed(false);}}/><p className="studio-hint">Use Markdown for headings, bold text and links. The secure unsubscribe link is added by the app.</p></div>
  <div className="flex flex-wrap gap-3"><button type="button" className="studio-btn studio-btn-secondary" disabled={working||!subject||!body} onClick={preview}>{busy?'Working…':'Preview current draft'}</button><button type="button" className="studio-btn studio-btn-secondary" disabled={working||!subject||!body} onClick={test}>{attempt?'Retry same test':'Send test to myself'}</button></div>
  <p className="studio-hint">Tests go only to your verified sign-in email and use a disabled sample unsubscribe link. They do not send to subscribers.</p>{attempt&&<p role="status" className="studio-hint">This test is unresolved. Its wording stays fixed until a retry confirms acceptance. Check the provider before starting a different test.</p>}
  {review&&<section className="space-y-3"><h3 className="studio-section-title">{current?'Current draft preview':'Earlier preview — refresh after editing'}</h3><p className="studio-hint">Subject: {review.subject}. The unsubscribe button is a disabled sample.</p><iframe title="Newsletter draft preview" sandbox="" referrerPolicy="no-referrer" srcDoc={review.html} className="w-full border border-line min-h-[650px] bg-paper"/></section>}
  <section className="studio-card space-y-4"><h3 className="studio-section-title">Review before {locked?'continuing':'sending'}</h3><p>Recipients: {locked?'the original saved recipient list (unsubscribed people are skipped)':`${activeCount} currently active subscribers`}. {locked?'This saved send keeps its original wording.':'Sending freezes this wording and recipient list for safe retries.'}</p><label className="flex items-start gap-3 min-h-[44px]"><input type="checkbox" className="studio-check mt-1" checked={confirmed&&!!current} disabled={!current||working||!!attempt} onChange={e=>setConfirmed(e.target.checked)}/>I reviewed the current preview and approve this newsletter for these recipients.</label>
  <input type="hidden" name="review_token" value={current?review?.token??'':''}/><input type="hidden" name="review_confirmed" value={confirmed&&current?'yes':'no'}/>
  <button type="submit" disabled={working||!current||!confirmed||!!attempt||(activeCount===0&&!locked)||(locked&&!state?.remaining)} className="studio-btn studio-btn-primary">{pending?'Sending…':locked?'Continue this send':`Send to ${activeCount} subscribers`}</button>{activeCount===0&&<p className="studio-hint">No active subscribers yet.</p>}</section>
 </form>;
}
