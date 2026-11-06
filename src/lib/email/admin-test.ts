import 'server-only';
import { Resend } from 'resend';
import { requireAdmin } from '@/lib/auth';
import { createClient, createServiceClient } from '@/lib/supabase/server';
export async function sendAdminEmailTest(id:string,payload:{subject:string;html:string;text?:string}) {
 await requireAdmin();
 if(!/^[a-f0-9-]{36}$/i.test(id))throw new Error('Start a new test before sending.');
 const {data:{user},error}=await (await createClient()).auth.getUser();
 if(error||!user?.email||!user.email_confirmed_at)throw new Error('A verified administrator email is required.');
 if(!process.env.RESEND_API_KEY)throw new Error('Email sending is not configured.');
 const service=createServiceClient();
 const snapshot={...payload,subject:`[TEST] ${payload.subject}`};
 const prepared=await service.rpc('prepare_email_studio_test',{p_id:id,p_actor:user.id,p_recipient:user.email,p_payload:snapshot});
 if(prepared.error)throw new Error(prepared.error.message);
 const attempt=prepared.data as {status:string};
 if(attempt.status==='accepted')return 'This test was already accepted by the email provider.';
 const result=await new Resend(process.env.RESEND_API_KEY).emails.send({from:process.env.RESEND_FROM_EMAIL??'One Flame Records <noreply@oneflamerecords.com>',to:user.email,...snapshot},{idempotencyKey:`email-studio-test/${id}`});
 if(result.error)throw new Error('The test was not accepted. Retry this same test; its wording and recipient stay fixed.');
 if(!result.data?.id)throw new Error('The test response has no provider receipt. Retry this same test safely.');
 const saved=await service.from('email_studio_tests').update({status:'accepted',provider_id:result.data.id}).eq('id',id).eq('actor',user.id);
 if(saved.error)throw new Error('The provider accepted the test but its receipt could not be saved. Retry this same test safely.');
 return 'Test accepted by the provider for your verified sign-in email. Check your inbox; delivery is not yet confirmed.';
}
