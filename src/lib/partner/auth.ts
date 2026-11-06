import 'server-only';
import { redirect } from 'next/navigation';
import { requireAdmin, currentUserId } from '@/lib/auth';
import { createClient } from './database';

export async function requirePartnerAdmin(): Promise<string> {
  await requireAdmin();
  const id=await currentUserId();
  if(!id) throw Error('Unauthorized');
  return id;
}
export async function requirePartnerMember() {
  const db=await createClient();
  const {data:{user},error}=await db.auth.getUser();
  if(error || !user) redirect('/flames-partner/login');
  const {data:account,error:lookupError}=await db.from('partner_accounts').select('member_id').eq('user_id',user.id).maybeSingle();
  if(lookupError) throw Error('Your savings account could not be loaded. Please try again.');
  return {db,user,memberId:account?.member_id as string|undefined};
}
