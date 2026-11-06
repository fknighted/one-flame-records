import 'server-only';
import { createServiceClient } from '@/lib/supabase/server';
import { defaultEmailDraft, renderEmailDraft, type EmailTemplateKey } from './studio';
export async function renderManagedEmail(key:EmailTemplateKey,details:{name?:string;url?:string}={}) {
 const result=await createServiceClient().from('email_studio_templates').select('subject,opening,body').eq('key',key).maybeSingle();
 // A failed lookup must never replace the owner's saved wording with defaults.
 if(result.error)throw new Error('Could not load saved email wording. Please retry before sending.');
 return renderEmailDraft(key,result.data??defaultEmailDraft(key),details);
}
