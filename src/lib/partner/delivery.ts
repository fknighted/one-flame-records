import 'server-only';
import { Resend } from 'resend';
import { createAdminClient } from './database';
import { PARTNER_EMAIL_BRAND, partnerSender, renderPartnerEmail } from './email';
import { getTier, type TierKey } from './rules';

type Job={id:string;lease_id:string;member_id:string;recipient:string;kind:string;payload:Mail|null;created_at:string;attempts:number;first_send_at:string|null;prepared_at:string|null};
type Mail={from:string;to:string;subject:string;html:string;text:string};
function origin() {
  const url=new URL(process.env.NEXT_PUBLIC_SITE_URL??'https://oneflamerecords.com');
  if(url.protocol!=='https:' && !['localhost','127.0.0.1'].includes(url.hostname))throw Error('A secure site address is required.');
  return url.origin;
}
async function save(job:Job,patch:object) {
  await createAdminClient().from('partner_delivery_jobs').update(patch).eq('id',job.id).eq('lease_id',job.lease_id).select('id').single().throwOnError();
}
async function prepare(job:Job):Promise<Mail> {
  const refreshUnsentLink=job.kind==='approved'&&!job.first_send_at&&(!job.prepared_at||Date.now()-Date.parse(job.prepared_at)>45*60*1000);
  const refreshUnsentBrand=job.payload&&!job.first_send_at&&!job.payload.html.includes(PARTNER_EMAIL_BRAND);
  if(job.payload&&!refreshUnsentLink&&!refreshUnsentBrand)return job.payload;
  const db=createAdminClient();
  const {data:m}=await db.from('partner_members').select('id,email,full_name,tier').eq('id',job.member_id).single().throwOnError();
  const {data:g}=await db.from('partner_guarantors').select('full_name,email,approval_token,status').eq('member_id',job.member_id).single().throwOnError();
  if(!m||!g)throw Error('The member or guarantor could not be found.');
  let subject='',text='';
  const links:string[]=[];
  if(job.kind==='application'){
    subject='Your Flames Partner application is received';
    text=`Hi ${m.full_name},\nYour application is saved. Your guarantor will receive a separate request to review. You will be notified once they respond.\nFlames Partner`;
  } else if(job.kind==='guarantor_request'){
    const tier=getTier(m.tier as TierKey);
    const base=origin()+'/flames-partner/guarantor/respond?token='+encodeURIComponent(g.approval_token);
    links.push(base+'&action=approve',base+'&action=decline');
    subject='Guarantor request — Flames Partner';
    text=`Hi ${g.full_name},\n${m.full_name} has nominated you as their guarantor. Review the request before deciding. Approval covers up to J$${tier.guarantorMaxLiability.toLocaleString('en-JM')} of unpaid contributions following a draw.\nReview approval: ${base}&action=approve\nReview decline: ${base}&action=decline\nThe request expires seven days after application.\nFlames Partner`;
  } else if(job.kind==='approved'){
    if(g.status!=='approved')throw Error('Guarantor approval is required.');
    const {data:existing,error:lookupError}=await db.rpc('partner_lookup_account',{p_email:m.email});
    if(lookupError)throw Error('Account lookup is temporarily unavailable.');
    let userId=existing as string|null;
    if(!userId){
      const {data,error}=await db.auth.admin.createUser({email:m.email,email_confirm:false,app_metadata:{partner_member_id:m.id}});
      if(error){
        const retry=await db.rpc('partner_lookup_account',{p_email:m.email});
        if(retry.error||!retry.data)throw Error('Account setup is pending.');
        userId=retry.data;
      }else userId=data.user.id;
    }
    // Trusted app metadata identifies this workflow's account even if the
    // first attempt stopped between creating Auth and correcting the profile.
    const {data:account,error:accountError}=await db.auth.admin.getUserById(userId!);
    if(accountError||!account.user)throw Error('Account setup needs retry.');
    if(account.user.app_metadata?.partner_member_id===m.id){
      const {data:profile}=await db.from('profiles').select('role,artist_id,is_bartender').eq('id',userId).single().throwOnError();
      if(profile?.role==='artist'&&!profile.artist_id&&!profile.is_bartender){
        const {error:roleError}=await db.from('profiles').update({role:'partner'}).eq('id',userId).eq('role','artist').is('artist_id',null).eq('is_bartender',false);
        if(roleError)throw Error('New savings account access needs retry.');
      }else if(profile?.role!=='partner')throw Error('Account role requires owner review.');
    }
    const linked=await db.rpc('partner_link_account',{p_member:m.id,p_user:userId});
    if(linked.error)throw Error('Account linkage requires review.');
    const {data:link,error:linkError}=await db.auth.admin.generateLink({type:'magiclink',email:m.email,options:{redirectTo:origin()+'/auth/callback'}});
    if(linkError||link?.user?.id!==userId||!/^\d{8}$/.test(link?.properties?.email_otp??''))throw Error('Account email could not be prepared.');
    const setup=origin()+'/flames-partner/account-setup';
    const login=origin()+'/flames-partner/login';
    links.push(setup,login);
    subject='Your guarantor approved — Flames Partner';
    text=`Hi ${m.full_name},\nYour guarantor approved. Your single-use account code: ${link.properties.email_otp}\nOpen the account page and enter your email and this code to sign in and set a password if needed:\n${setup}\nIf you already have a password, you can sign in normally:\n${login}\nUse the code promptly; request a new one if it expires.\nFlames Partner`;
  }else if(job.kind==='declined'){
    subject='Guarantor response — Flames Partner';
    text=`Hi ${m.full_name},\nYour guarantor declined the request. Contact Flames Partner to discuss the next step. Your application has not been activated.\nFlames Partner`;
  }else throw Error('Unknown notification kind.');
  const mail={from:partnerSender(process.env.RESEND_FROM_EMAIL??'noreply@oneflamerecords.com'),to:job.recipient,subject,text,html:renderPartnerEmail(subject,text,links)};
  await save(job,{payload:mail,prepared_at:new Date().toISOString()});
  return mail;
}
export async function dispatchPartnerMail(memberId?:string) {
  const db=createAdminClient();
  if(process.env.PARTNER_EMAIL_TRANSPORT!=='resend'||!process.env.RESEND_API_KEY){
    const query=db.from('partner_delivery_jobs').select('id',{count:'exact',head:true}).neq('status','sent');
    const result=await (memberId?query.eq('member_id',memberId):query).throwOnError();
    return {pending:result.count??0};
  }
  const {data:jobs,error}=await db.rpc('partner_claim_mail',{p_member:memberId??null});
  if(error)throw Error('The saved email queue could not be loaded.');
  for(const job of (jobs??[]) as Job[]){
    try{
      const mail=await prepare(job);
      // Provider retry protection lasts 24 hours. A later unknown outcome needs
      // owner reconciliation, rather than an automatic duplicate customer email.
      if(job.first_send_at&&Date.now()-Date.parse(job.first_send_at)>(job.kind==='approved'?45*60*1000:23*60*60*1000))throw Error('Earlier delivery outcome needs owner review.');
      if(!job.first_send_at)await save(job,{first_send_at:new Date().toISOString()});
      const {error:sendError}=await new Resend(process.env.RESEND_API_KEY).emails.send(mail,{idempotencyKey:'partner/'+job.id});
      if(sendError)throw Error('The email provider could not confirm delivery.');
      await save(job,{status:'sent',sent_at:new Date().toISOString(),lease_until:null,lease_id:null,last_error:null});
    }catch{
      // Do not log addresses, names, secure links or provider response bodies.
      await db.from('partner_delivery_jobs').update({status:'pending',lease_until:null,lease_id:null,last_error:'Delivery pending; retry or review the earlier attempt.'}).eq('id',job.id).eq('lease_id',job.lease_id).throwOnError();
    }
  }
  const query=db.from('partner_delivery_jobs').select('id',{count:'exact',head:true}).neq('status','sent');
  const result=await (memberId?query.eq('member_id',memberId):query).throwOnError();
  return {pending:result.count??0};
}
