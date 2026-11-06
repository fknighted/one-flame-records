'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin, currentUserId } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { sendAdminEmailTest } from '@/lib/email/admin-test';
import { isEmailTemplateKey, renderEmailDraft, SAMPLE_EMAIL_DETAILS, validateEmailDraft, type EmailDraft } from '@/lib/email/studio';
export async function saveEmailTemplate(key:string,draft:EmailDraft,version:number) {
 await requireAdmin();
 try {
  if(!isEmailTemplateKey(key)||!Number.isInteger(version)||version<0)throw new Error('Select a valid template.');
  const clean=validateEmailDraft(draft);const actor=await currentUserId();if(!actor)throw new Error('Sign in again.');
  const result=await createServiceClient().rpc('save_email_studio_template',{p_key:key,p_subject:clean.subject,p_opening:clean.opening,p_body:clean.body,p_version:version,p_actor:actor});
  if(result.error)throw new Error(result.error.message);
  revalidatePath('/admin/email-studio');return {version:result.data,message:'Saved. Future messages use this wording.'};
 }catch(error){return {error:error instanceof Error?error.message:'Could not save. Your draft is still here.'};}
}
export async function testEmailTemplate(key:string,draft:EmailDraft,id:string) {
 await requireAdmin();
 try {
  if(!isEmailTemplateKey(key))throw new Error('Select a valid template.');
  return {message:await sendAdminEmailTest(id,renderEmailDraft(key,draft,SAMPLE_EMAIL_DETAILS))};
 }catch(error){return {error:error instanceof Error?error.message:'Test response was interrupted. Retry this same test.'};}
}
