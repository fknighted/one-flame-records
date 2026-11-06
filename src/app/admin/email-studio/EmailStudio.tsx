'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { defaultEmailDraft, EMAIL_TEMPLATES, renderEmailDraft, SAMPLE_EMAIL_DETAILS, type EmailDraft, type EmailTemplateKey } from '@/lib/email/studio';
import { saveEmailTemplate, testEmailTemplate } from './actions';
export type SavedEmailTemplate=EmailDraft & {key:string;version:number;updated_at:string};
export default function EmailStudio({saved}:{saved:SavedEmailTemplate[]}) {
 const router=useRouter();
 const [key,setKey]=useState<EmailTemplateKey>('application-approved');
 const [drafts,setDrafts]=useState<Partial<Record<EmailTemplateKey,EmailDraft>>>({});
 const [versions,setVersions]=useState<Partial<Record<EmailTemplateKey,number>>>({});
 const [message,setMessage]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [attempt,setAttempt]=useState<{id:string;key:EmailTemplateKey;draft:EmailDraft}|null>(null);
 const record=saved.find(row=>row.key===key);const draft=drafts[key]??record??defaultEmailDraft(key);const meta=EMAIL_TEMPLATES[key];
 let html='',validation='';try{html=renderEmailDraft(key,draft,SAMPLE_EMAIL_DETAILS).html;}catch(e){validation=e instanceof Error?e.message:'Check your wording.';}
 const dirty=JSON.stringify({subject:draft.subject,opening:draft.opening,body:draft.body})!==JSON.stringify(record?{subject:record.subject,opening:record.opening,body:record.body}:defaultEmailDraft(key));
 async function save(){setBusy(true);setError('');setMessage('');try{const result=await saveEmailTemplate(key,draft,versions[key]??record?.version??0);if(result.error)setError(result.error);else {setVersions(v=>({...v,[key]:result.version}));setMessage(result.message??'Saved.');router.refresh();}}catch{setError('Save response interrupted. Reload before saving again; your draft remains here.');}finally{setBusy(false);}}
 async function test(){const next=attempt??{id:crypto.randomUUID(),key,draft:{subject:draft.subject,opening:draft.opening,body:draft.body}};setAttempt(next);setBusy(true);setError('');setMessage('');try{const result=await testEmailTemplate(next.key,next.draft,next.id);if(result.error)setError(result.error);else{setMessage(result.message??'Test accepted.');setAttempt(null);}}catch{setError('Test response interrupted. Retry the same test to avoid a duplicate.');}finally{setBusy(false);}}
 return <div className="space-y-6">
  <div className="max-w-3xl"><p className="studio-label mb-2">Customer communication</p><h1 className="studio-page-title">Email Studio</h1><p className="mt-3 text-muted">Review the emails people receive. Edit the wording, check a sample and save it for future messages.</p></div>
  <div><label htmlFor="email-template" className="studio-field-label">Email to review</label><select id="email-template" className="studio-field max-w-2xl" value={key} disabled={busy||!!attempt} onChange={e=>{setKey(e.target.value as EmailTemplateKey);setMessage('');setError('');}}>{Object.entries(EMAIL_TEMPLATES).map(([id,item])=><option key={id} value={id}>{item.label}</option>)}</select></div>
  <section className="studio-card max-w-3xl space-y-2"><h2 className="studio-section-title">{meta.label}</h2><p className="text-muted">{meta.trigger}</p><p><strong>Recipient:</strong> {meta.recipient}</p><p><strong>Sending:</strong> {meta.mode}</p><p className="studio-hint">Names, secure buttons and required notices are added by the app. Use plain wording without links or placeholders.</p>{record&&<p className="studio-hint">Last saved {new Date(record.updated_at).toLocaleString('en-JM',{timeZone:'America/Jamaica'})} (Jamaica).</p>}</section>
  {error&&<p role="alert" className="studio-error">{error}</p>}{message&&<p role="status" className="studio-success">{message}</p>}
  <div className="grid gap-6 xl:grid-cols-2 items-start">
   <section className="studio-card space-y-5 min-w-0"><h2 className="studio-section-title">Wording <span className="studio-chip studio-chip-neutral">{dirty?'Unsaved draft':'Saved wording'}</span></h2>
    {(['subject','opening','body'] as const).map(field=><div key={field}><label className="studio-field-label" htmlFor={`email-${field}`}>{field==='body'?'Message':field==='subject'?'Subject':'Opening heading'} *</label>{field==='body'?<textarea id={`email-${field}`} rows={10} maxLength={6000} className="studio-field" value={draft[field]} disabled={busy||!!attempt} onChange={e=>setDrafts(d=>({...d,[key]:{...draft,[field]:e.target.value}}))}/>:<input id={`email-${field}`} maxLength={200} className="studio-field" value={draft[field]} disabled={busy||!!attempt} onChange={e=>setDrafts(d=>({...d,[key]:{...draft,[field]:e.target.value}}))}/>}</div>)}
    {validation&&<p role="alert" className="studio-error">{validation}</p>}
    <div className="flex flex-wrap gap-3"><button type="button" className="studio-btn studio-btn-primary" disabled={busy||!!validation||!!attempt} onClick={save}>{busy?'Working…':'Save wording'}</button><button type="button" className="studio-btn studio-btn-secondary" disabled={busy||!!validation} onClick={test}>{attempt?'Retry same test':'Send test to myself'}</button><button type="button" className="studio-btn studio-btn-quiet" disabled={busy||!!attempt} onClick={()=>setDrafts(d=>({...d,[key]:defaultEmailDraft(key)}))}>Load original wording</button></div>
    <p className="studio-hint">Tests use only sample details and go to your verified sign-in email. Saving does not send a customer email. Loading original wording is a draft until saved.</p>{attempt&&<p role="status" className="studio-hint">This test has an unresolved result. Its wording stays fixed. Retry this test; check the provider before starting another.</p>}
   </section>
   <section className="min-w-0 space-y-3"><h2 className="studio-section-title">Draft preview</h2><p className="studio-hint">Shows your current unsaved edits. Sample recipient: Sample Artist. Buttons use a non-working sample link.</p>{html?<iframe title="Current email draft preview" sandbox="" referrerPolicy="no-referrer" srcDoc={html} className="w-full border border-line min-h-[760px] bg-paper"/>:<p className="studio-error">Correct the wording to see a preview.</p>}</section>
  </div>
 </div>;
}
