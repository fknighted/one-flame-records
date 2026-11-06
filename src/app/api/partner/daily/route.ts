import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createAdminClient } from '@/lib/partner/database';
import { dispatchPartnerMail } from '@/lib/partner/delivery';
export async function GET(request:NextRequest) {
  const secret=process.env.CRON_SECRET;
  const incoming=request.headers.get('authorization')??'';
  const expected=secret?'Bearer '+secret:'';
  if(!secret||Buffer.byteLength(incoming)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(incoming),Buffer.from(expected)))return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data,error}=await createAdminClient().rpc('partner_daily_maintenance');
  if(error)return NextResponse.json({error:'Maintenance could not finish.'},{status:503});
  try{return NextResponse.json({ok:true,maintenance:data,mail:await dispatchPartnerMail()});}
  catch{return NextResponse.json({error:'Maintenance completed; saved email queue needs retry.'},{status:503});}
}
