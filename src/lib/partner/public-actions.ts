'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { randomBytes } from 'node:crypto';
import { createAdminClient } from './database';
import { dispatchPartnerMail } from './delivery';

const person=z.object({full_name:z.string().trim().min(1).max(160),email:z.email().trim().max(254).transform(v=>v.toLowerCase()),phone:z.string().trim().min(1).max(254),address:z.string().trim().min(1).max(1000),employer:z.string().trim().min(1).max(254)});
const member=person.extend({payment_day:z.string().regex(/^[0-6]$/)});
const guarantor=person.extend({relationship_to_member:z.string().trim().min(1).max(254)});
export async function submitSignup(memberData:unknown,guarantorData:unknown,tier:unknown,requestId:unknown) {
  const m=member.safeParse(memberData),g=guarantor.safeParse(guarantorData);
  if(!m.success||!g.success||tier!=='spark'||!z.uuid().safeParse(requestId).success)return {error:'Complete the member and guarantor details and choose the open Spark tier.'};
  if(m.data.email===g.data.email)return {error:'Your guarantor must use a different email address.'};
  const db=createAdminClient();
  const {data:memberId,error}=await db.rpc('partner_apply_application',{p_member:{...m.data,tier},p_guarantor:{...g.data,approval_token:randomBytes(32).toString('hex')},p_request_id:requestId});
  if(error)return {error:'The application could not be saved. If you already applied, contact One Flame Records. Otherwise check your details and try again later.'};
  // The queue was written in the same transaction as the application. A mail
  // failure must not make a saved application appear lost or invite duplicates.
  try{await dispatchPartnerMail(memberId);}catch{/* Saved queue remains recoverable. */}
  redirect('/flames-partner/signup/success');
}
export async function captureInterest(email:unknown,tier:unknown) {
  const parsed=z.object({email:z.email().max(254),tier:z.enum(['blaze','inferno'])}).safeParse({email,tier});
  if(!parsed.success)return {error:'Enter a valid email and choose a coming-soon tier.'};
  const {error}=await createAdminClient().rpc('partner_capture_interest',{p_email:parsed.data.email,p_tier:parsed.data.tier});
  return error?{error:'Your interest could not be saved. Please try again later.'}:{success:true};
}
export async function respondToGuarantorRequest(token:string,response:'approve'|'decline') {
  if(!z.string().min(32).max(256).safeParse(token).success||!['approve','decline'].includes(response))redirect('/flames-partner/guarantor/respond/invalid');
  const {data,error}=await createAdminClient().rpc('partner_respond_guarantor',{p_token:token,p_response:response});
  if(error)throw Error('Your response could not be saved. Please try again.');
  if(data.member_id){try{await dispatchPartnerMail(data.member_id);}catch{/* Admin can retry the saved queue. */}}
  const status=['approved','declined','used','expired','invalid'].includes(data.status)?data.status:'invalid';
  redirect('/flames-partner/guarantor/respond/'+status);
}
