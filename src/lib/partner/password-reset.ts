'use server';
import { z } from 'zod';
import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from './database';
import { partnerSender, renderPartnerEmail } from './email';

export async function requestPartnerPasswordReset(value:unknown):Promise<{ok:true}> {
  const result={ok:true} as const;
  const parsed=z.string().trim().max(254).pipe(z.email()).transform(v=>v.toLowerCase()).safeParse(value);
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!parsed.success||!key||process.env.PARTNER_EMAIL_TRANSPORT!=='resend'||!process.env.RESEND_API_KEY)return result;
  try{
    const db=createAdminClient();
    const h=await headers();
    const ip=(h.get('x-forwarded-for')?.split(',')[0]??'unknown').trim().slice(0,128);
    const digest=(v:string)=>createHmac('sha256',key).update(v).digest('hex');
    for(const [scope,limit] of [['all',30],['ip:'+digest(ip),10],['email:'+digest(parsed.data),3]] as const){
      const {data,error}=await db.rpc('consume_form_limit',{p_key:'partner-reset:'+scope,p_limit:limit,p_window_seconds:3600});
      if(error||!data)return result;
    }
    // Membership lookup and delivery run after the same public response. Neither
    // response text nor its lookup/send timing reveals whether an account exists.
    after(async()=>{
      try{
        const {data:account,error}=await db.from('partner_accounts').select('user_id,partner_members!inner(email,deleted_at)').eq('partner_members.email',parsed.data).is('partner_members.deleted_at',null).maybeSingle();
        if(error||!account)return;
        const {data:auth,error:authError}=await db.auth.admin.getUserById(account.user_id);
        if(authError||!auth.user||auth.user.id!==account.user_id||auth.user.email?.toLowerCase()!==parsed.data)return;
        const {data:recovery,error:linkError}=await db.auth.admin.generateLink({type:'recovery',email:parsed.data});
        if(linkError||recovery?.user?.id!==account.user_id||!/^\d{8}$/.test(recovery?.properties?.email_otp??''))return;
        const site=new URL(process.env.NEXT_PUBLIC_SITE_URL??'https://www.oneflamerecords.com');
        if(site.protocol!=='https:'&&!['127.0.0.1','localhost'].includes(site.hostname))return;
        const url=site.origin+'/flames-partner/reset-password';
        const subject='Reset your Flames Partner password';
        const text=`A password reset was requested for your Flames Partner account.\nYour single-use reset code: ${recovery.properties.email_otp}\nOpen the reset page and enter your email and this code:\n${url}\nIf you did not request this, ignore this email. Your password has not been changed. Use the code promptly; request a new one if it expires.\nFlames Partner`;
        await new Resend(process.env.RESEND_API_KEY).emails.send({from:partnerSender(process.env.RESEND_FROM_EMAIL??'noreply@oneflamerecords.com'),to:parsed.data,subject,text,html:renderPartnerEmail(subject,text,[url])});
      }catch{/* No addresses, recovery codes or provider responses in logs. */}
    });
  }catch{/* A uniform public response also covers unavailable rate-limit storage. */}
  return result;
}
