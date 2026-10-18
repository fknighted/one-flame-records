"use server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin, currentUserId } from "@/lib/auth";
import { EMAIL_COLORS,emailLayout,styleMarkdownHtml } from "@/lib/email/layout";
import { renderSafeMarkdown } from "@/lib/email/markdown";
import { newsletterToken } from "@/lib/email/newsletter-token";
export type NewsletterState={error?:string;sent?:number;remaining?:number;runId?:string;uncertain?:number}|null;
export async function sendNewsletter(_prev:NewsletterState,data:FormData):Promise<NewsletterState>{
 await requireAdmin();const actor=await currentUserId();
 const subject=String(data.get("subject")??"").trim();const body=String(data.get("body")??"").trim();const id=String(data.get("run_id")??"");
 if(!subject||subject.length>200||!body||body.length>50000||!/^[a-f0-9-]{36}$/i.test(id)||!actor)return {error:"Enter a subject up to 200 characters and a body up to 50,000 characters."};
 if(!process.env.RESEND_API_KEY)return {error:"Email sending is not configured."};
 const service=createServiceClient();const prepared=await service.rpc("prepare_newsletter",{p_id:id,p_subject:subject,p_body:body,p_actor:actor});
 if(prepared.error)return {error:prepared.error.message};
 const batch=await service.rpc("claim_newsletter_batch",{p_id:id});if(batch.error)return {error:batch.error.message,runId:id};
 const html=styleMarkdownHtml(await renderSafeMarkdown(body));const resend=new Resend(process.env.RESEND_API_KEY);
 let sendError:string|undefined;
 const attempted=new Set<string>();
 for(const recipient of batch.data??[]){
  const active=await service.from("fan_subscribers").select("status").eq("id",recipient.subscriber_id).single();
  if(active.error){sendError="Could not check subscriber status. Resume this send later.";break;}
  if(active.data.status!=="active"){await service.from("newsletter_deliveries").update({status:"skipped"}).eq("run_id",id).eq("subscriber_id",recipient.subscriber_id);continue;}
  const url=`${process.env.NEXT_PUBLIC_SITE_URL??"https://www.oneflamerecords.com"}/unsubscribe?token=${encodeURIComponent(newsletterToken(recipient.email,"unsubscribe"))}`;
  try{
   attempted.add(recipient.subscriber_id);
   await new Promise(resolve=>setTimeout(resolve,550));
   const result=await resend.emails.send({from:process.env.RESEND_FROM_EMAIL??"One Flame Records <noreply@oneflamerecords.com>",to:recipient.email,subject,html:emailLayout({title:subject,body:html,footerHtml:`You subscribed to One Flame Records. <a href="${url}" style="color:${EMAIL_COLORS.yellow};">Unsubscribe</a>`}),headers:{"List-Unsubscribe":`<${url}>`}}, {idempotencyKey:`newsletter/${id}/${recipient.subscriber_id}`});
   if(result.error){sendError="Email provider rejected a message. Resume this send later.";await service.from("newsletter_deliveries").update({status:"failed"}).eq("run_id",id).eq("subscriber_id",recipient.subscriber_id);break;}
   const saved=await service.from("newsletter_deliveries").update({status:"accepted",provider_id:result.data?.id??null}).eq("run_id",id).eq("subscriber_id",recipient.subscriber_id);
   if(saved.error){sendError="Provider accepted a message but its receipt could not be saved. Resume later with the same send.";break;}
  }catch{sendError="Delivery response was interrupted. Resume later with the same send to avoid duplicates.";break;}
 }
 const unattempted=(batch.data??[]).filter(row=>!attempted.has(row.subscriber_id));
 if(unattempted.length){
  const released=await service.from("newsletter_deliveries").update({status:"pending",claimed_at:null}).eq("run_id",id).eq("status","sending").in("subscriber_id",unattempted.map(row=>row.subscriber_id));
  if(released.error)sendError="Some messages are waiting for recovery. Keep this send and resume in ten minutes.";
 }
 const counts=await Promise.all(["accepted","uncertain","pending","sending","failed"].map(status=>service.from("newsletter_deliveries").select("run_id",{head:true,count:"exact"}).eq("run_id",id).eq("status",status)));
 if(counts.some(c=>c.error))return {error:"Could not load delivery progress. Keep this send open and retry.",runId:id};
 return {runId:id,sent:counts[0].count??0,uncertain:counts[1].count??0,remaining:counts.slice(2).reduce((n,c)=>n+(c.count??0),0),error:sendError};
}
