'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/partner/database';
import { requirePartnerAdmin } from '@/lib/partner/auth';
import { dispatchPartnerMail } from '@/lib/partner/delivery';

export type PartnerActionState = { error?: string; success?: string } | null;
const uuid=z.uuid();
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===v;},'Choose a valid date.');
const person=z.object({full_name:z.string().trim().min(1).max(160),email:z.email().max(254),phone:z.string().trim().min(1).max(254),address:z.string().trim().min(1).max(1000),employer:z.string().trim().min(1).max(254),payment_day:z.string().regex(/^[0-6]$/),tier:z.enum(['spark','blaze','inferno'])});
async function operation(actor:string,request:unknown,name:string,payload:object) {
  const parsed=uuid.safeParse(request);
  if(!parsed.success) return {error:'The form expired. Reload the page and try again.'};
  const {data,error}=await createAdminClient().rpc('partner_admin_operation',{p_actor:actor,p_request_id:parsed.data,p_operation:name,p_payload:payload});
  if(error) return {error:'The change was not saved. '+safeMessage(error.message)};
  revalidatePath('/admin/partner','layout');
  revalidatePath('/flames-partner/dashboard');
  return {data};
}
function safeMessage(message:string) {
  const allowed=['Contribution already received','Member is not accepting contributions','Insufficient tier funds','Next eligible member must be scheduled first','Member is not eligible','Draw is not scheduled','Invalid status transition','Draw belongs to another member','Request identifier already used','Member not found','Draw not found'];
  return allowed.find(v=>message.includes(v))??'Check the details and try again.';
}
export async function recordPayment(memberId:string,_previous:PartnerActionState,form:FormData):Promise<PartnerActionState> {
  const actor=await requirePartnerAdmin();
  const parsed=z.object({member_id:uuid,week_number:z.string().regex(/^(?:[1-9]|1[0-9]|20)$/).transform(Number),due_date:day,method:z.enum(['cash','bank_transfer']),late_fee:z.boolean()}).safeParse({member_id:memberId,week_number:form.get('week_number'),due_date:form.get('due_date'),method:form.get('method'),late_fee:form.get('late_fee')==='on'});
  if(!parsed.success)return {error:'Choose a week from 1 to 20, a valid date and a payment method.'};
  const r=await operation(actor,form.get('request_id'),'record_payment',parsed.data);
  return 'error' in r?r:{success:'Contribution recorded.'};
}
export async function updateMemberStatus(memberId:string,status:string,_previous:PartnerActionState,form:FormData):Promise<PartnerActionState> {
  const actor=await requirePartnerAdmin();
  if(!uuid.safeParse(memberId).success||!['withdrawn','defaulted_predraw','defaulted_postdraw','active','drew'].includes(status))return {error:'That status change is not available.'};
  const r=await operation(actor,form.get('request_id'),'status',{member_id:memberId,status});
  return 'error' in r?r:{success:'Member status updated.'};
}
export async function createTestMember(_previous:PartnerActionState,form:FormData):Promise<PartnerActionState> {
  const actor=await requirePartnerAdmin();
  const parsed=person.safeParse(Object.fromEntries(form));
  if(!parsed.success)return {error:'Complete all member fields and choose a valid tier and payment day.'};
  const r=await operation(actor,form.get('request_id'),'create_member',parsed.data);
  if('error' in r)return r;
  redirect('/admin/partner/members/'+r.data.member_id);
}
export async function scheduleDraw(_previous:PartnerActionState,form:FormData):Promise<PartnerActionState> {
  const actor=await requirePartnerAdmin();
  const parsed=z.object({member_id:uuid,scheduled_week:day}).safeParse(Object.fromEntries(form));
  if(!parsed.success)return {error:'Select a member and a valid date.'};
  const r=await operation(actor,form.get('request_id'),'schedule_draw',parsed.data);
  return 'error' in r?r:{success:'Draw scheduled.'};
}
export async function markDrawPaid(drawId:string,memberId:string,_previous:PartnerActionState,form:FormData):Promise<PartnerActionState> {
  const actor=await requirePartnerAdmin();
  if(!uuid.safeParse(drawId).success||!uuid.safeParse(memberId).success)return {error:'Invalid draw.'};
  const r=await operation(actor,form.get('request_id'),'pay_draw',{draw_id:drawId,member_id:memberId});
  return 'error' in r?r:{success:'Draw marked paid.'};
}
export async function cancelDraw(drawId:string,_previous:PartnerActionState,form:FormData):Promise<PartnerActionState> {
  const actor=await requirePartnerAdmin();
  if(!uuid.safeParse(drawId).success)return {error:'Invalid draw.'};
  const r=await operation(actor,form.get('request_id'),'cancel_draw',{draw_id:drawId});
  return 'error' in r?r:{success:'Draw cancelled.'};
}
export async function retryMemberMail(memberId:string,_previous:PartnerActionState,_form:FormData):Promise<PartnerActionState> {
  void _previous;void _form;
  await requirePartnerAdmin();
  if(!uuid.safeParse(memberId).success)return {error:'Invalid member.'};
  const result=await dispatchPartnerMail(memberId);
  revalidatePath('/admin/partner/members/'+memberId);
  return result.pending?{error:'Delivery is still pending. Check email configuration or try again later.'}:{success:'Queued messages processed.'};
}
