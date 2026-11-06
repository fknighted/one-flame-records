import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function load(file, imports) {
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const m={exports:{}};
 new Function('require','module','exports',code)(name=>{if(!(name in imports))throw Error('Unexpected import '+name);return imports[name];},m,m.exports);
 return m.exports;
}
const {z}=await import('zod');
let calls=[],allowed=false;
const db={rpc:async(name,payload)=>{calls.push({name,payload});return {data:{member_id:'11111111-1111-4111-8111-111111111111'},error:null};}};
const actions=load('src/lib/partner/admin-actions.ts',{
 'zod':{z},'next/cache':{revalidatePath(){}},'next/navigation':{redirect:p=>{throw Error('redirect:'+p);}},
 '@/lib/partner/database':{createAdminClient:()=>db},
 '@/lib/partner/auth':{requirePartnerAdmin:async()=>{if(!allowed)throw Error('Forbidden');return '22222222-2222-4222-8222-222222222222';}},
 '@/lib/partner/delivery':{dispatchPartnerMail:async()=>({pending:0})},
});
let form=new FormData();form.set('request_id','33333333-3333-4333-8333-333333333333');form.set('week_number','1');form.set('method','cash');form.set('due_date','2026-11-06');form.set('amount','999999');
await assert.rejects(()=>actions.recordPayment('11111111-1111-4111-8111-111111111111',null,form),/Forbidden/);
assert.equal(calls.length,0,'unauthorized caller never reaches privileged DB');
allowed=true;
form.set('week_number','1x');assert.ok((await actions.recordPayment('11111111-1111-4111-8111-111111111111',null,form)).error);assert.equal(calls.length,0);
form.set('week_number','1');form.set('late_fee','on');await actions.recordPayment('11111111-1111-4111-8111-111111111111',null,form);
assert.equal(calls.length,1);assert.equal(calls[0].name,'partner_admin_operation');assert.deepEqual(calls[0].payload.p_payload,{member_id:'11111111-1111-4111-8111-111111111111',week_number:1,due_date:'2026-11-06',method:'cash',late_fee:true});
form.set('due_date','2026-02-31');assert.ok((await actions.recordPayment('11111111-1111-4111-8111-111111111111',null,form)).error);assert.equal(calls.length,1);
console.log('PASS: direct action authorization, strict week/date validation, money derived in database, stable receipt identity');
const utilities=load('src/lib/partner/utils.ts',{'./rules':{APP_TIMEZONE:'America/Jamaica'}});
assert.equal(utilities.daysUntil('2026-11-06',new Date('2026-11-07T01:00:00Z')),0,'8pm Jamaica is still the due day');
assert.equal(utilities.daysUntil('2026-11-06',new Date('2026-11-07T06:00:00Z')),-1);
assert.equal(utilities.daysUntil('2026-11-08',new Date('2026-11-07T01:00:00Z')),2);
console.log('PASS: savings due dates follow Jamaica calendar days across UTC midnight');
const {timingSafeEqual}=await import('node:crypto');
let maintenanceCalls=0;
const oldCron=process.env.CRON_SECRET,oldPartnerCron=process.env.PARTNER_CRON_SECRET;
delete process.env.CRON_SECRET;delete process.env.PARTNER_CRON_SECRET;
const daily=load('src/app/api/partner/daily/route.ts',{'next/server':{NextResponse:{json:(body,options)=>({status:options?.status??200,body})}},'node:crypto':{timingSafeEqual},'@/lib/partner/database':{createAdminClient:()=>({rpc:async()=>{maintenanceCalls++;return {data:{},error:null};}})},'@/lib/partner/delivery':{dispatchPartnerMail:async()=>({pending:0})}});
const request=header=>({headers:{get:()=>header}});
try{
 assert.equal((await daily.GET(request('Bearer undefined'))).status,401);
 process.env.CRON_SECRET='fixture-cron-key';
 assert.equal((await daily.GET(request('Bearer fixture-cron-key'))).status,200);
 assert.equal((await daily.GET(request('Bearer fixture-cron-keé'))).status,401);
 assert.equal(maintenanceCalls,1,'unauthenticated daily calls must never touch money/status');
}finally{if(oldCron===undefined)delete process.env.CRON_SECRET;else process.env.CRON_SECRET=oldCron;if(oldPartnerCron!==undefined)process.env.PARTNER_CRON_SECRET=oldPartnerCron;}
console.log('PASS: platform daily job uses configured secret, refuses missing/Unicode invalid credentials before touching records');
