import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import EmailStudio from './EmailStudio';
export default async function EmailStudioPage(){
 await requireAdmin();
 const result=await createServiceClient().from('email_studio_templates').select('key,subject,opening,body,version,updated_at');
 return <div className="max-w-[1500px] space-y-8">{result.error?<section className="studio-error" role="alert"><h1 className="studio-page-title">Email Studio unavailable</h1><p>Saved wording could not be loaded. Retry later. The local email-studio migration must be released before this screen can be used.</p></section>:<EmailStudio saved={result.data??[]}/>}
  <section className="studio-card space-y-4 max-w-3xl"><h2 className="studio-section-title">Newsletters and sent messages</h2><p>Write, preview, test and review each newsletter before sending. Saved sends keep their original wording and progress; accepted by the provider does not prove inbox delivery.</p><Link className="studio-btn studio-btn-secondary" href="/admin/subscribers">Open newsletters & saved sends</Link><p className="studio-hint">Transactional sent-email history is not stored by this app. This studio does not invent past messages or change previously sent emails.</p></section>
  <section className="studio-card space-y-3 max-w-3xl"><h2 className="studio-section-title">Other email routes</h2><p><strong>Sign-in provider:</strong> first staff invitations, sign-in, account confirmation and password recovery use provider-managed templates. They cannot be edited here. Staff invitation resends use the editable app template above.</p><p><strong>Internal notifications:</strong> application-received emails go to the label administrator and contact-form emails go to the label inbox. Their structured submission facts remain controlled by the app.</p><p><strong>Standalone welcome:</strong> currently inactive. Approval already sends the artist welcome and portal setup email.</p></section>
 </div>;
}
