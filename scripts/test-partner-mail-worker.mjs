import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function library(file,imports={}){const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;const mod={exports:{}};new Function('require','module','exports',code)(name=>{if(!(name in imports))throw Error('Unexpected library import '+name);return imports[name];},mod,mod.exports);return mod.exports;}
const escaping=library('src/lib/email/escape.ts');
const layout=library('src/lib/email/layout.ts',{'./escape':escaping});
const partnerEmail=library('src/lib/partner/email.ts',{'@/lib/email/escape':escaping,'@/lib/email/layout':layout});
function worker({enabled=true,existingArtist=false,failRoleOnce=false,cached=false,kind='approved',attempted=false}={}) {
 const m={id:'member-fixture',email:'member@example.invalid',full_name:'<img src=x onerror=bad>',tier:'spark'};
 const job={id:'job-fixture',lease_id:'fixture-lease',member_id:m.id,recipient:m.email,kind,payload:cached?{from:'fixture@example.invalid',to:m.email,subject:'Expired',text:'expired link',html:'expired link'}:null,prepared_at:cached?'2020-01-01T00:00:00Z':null,first_send_at:attempted?new Date().toISOString():null,status:'pending',attempts:0};
 let account=existingArtist?{id:'existing',app_metadata:{}}:null;
 let profile={role:'artist',artist_id:existingArtist?'artist-fixture':null,is_bartender:false};
 let creates=0,links=0,sends=[],roleFailure=failRoleOnce;
 function query(table){let patch=null,head=false;const q={select(_s,o){head=o?.head;return q;},eq(){return q;},is(){return q;},neq(){return q;},single(){return q;},update(p){patch=p;return q;},throwOnError(){return q;},then(resolve,reject){
  try{
   if(table==='profiles'&&patch){if(roleFailure){roleFailure=false;return resolve({error:{message:'simulated interruption'}});}Object.assign(profile,patch);}
   if(table==='partner_delivery_jobs'&&patch)Object.assign(job,patch);
   const data=table==='partner_members'?m:table==='partner_guarantors'?{full_name:'Guarantor',email:'guarantor@example.invalid',approval_token:'fake-test-token',status:'approved'}:table==='profiles'?profile:job;
   return resolve({data,count:head?(job.status==='sent'?0:1):null,error:null});
  }catch(e){return reject(e);}
 }};return q;}
 const db={from:query,rpc:async(name)=>{
  if(name==='partner_claim_mail'){if(job.status==='sent')return {data:[],error:null};job.attempts++;return {data:[structuredClone(job)],error:null};}
  if(name==='partner_lookup_account')return {data:account?.id??null,error:null};
  if(name==='partner_link_account')return {data:null,error:null};
  throw Error('unexpected RPC '+name);
 },auth:{admin:{createUser:async options=>{creates++;account={id:'new-account',app_metadata:options.app_metadata};return {data:{user:account},error:null};},getUserById:async()=>({data:{user:account},error:null}),generateLink:async()=>{links++;return {data:{user:{id:account.id},properties:{action_link:'https://auth.example.invalid/new-link-'+links,email_otp:String(12345000+links)}},error:null};}}}};
 const imports={'server-only':{},resend:{Resend:class{emails={send:async(mail,options)=>{sends.push({mail,options});return {data:{id:'provider-fixture'},error:null};}}}},'./database':{createAdminClient:()=>db},'./email':partnerEmail,'@/lib/email/layout':layout,'@/lib/email/escape':{escapeHtml:v=>v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')},'./rules':{getTier:()=>({guarantorMaxLiability:24000})}};
 const code=ts.transpileModule(fs.readFileSync('src/lib/partner/delivery.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};new Function('require','module','exports','process',code)(name=>{if(!(name in imports))throw Error('Unexpected import '+name);return imports[name];},mod,mod.exports,{env:{PARTNER_EMAIL_TRANSPORT:enabled?'resend':'disabled',RESEND_API_KEY:'fictional-provider-key',RESEND_FROM_EMAIL:'Fixture <fixture@example.invalid>',NEXT_PUBLIC_SITE_URL:'https://example.invalid'}});
 return {run:()=>mod.exports.dispatchPartnerMail(m.id),state:()=>({creates,links,sends,profile,job})};
}
let w=worker({enabled:false});await w.run();assert.equal(w.state().creates,0);assert.equal(w.state().links,0);assert.equal(w.state().sends.length,0);
w=worker({cached:true});await w.run();assert.equal(w.state().links,1);assert.ok(w.state().sends[0].mail.text.includes('12345001'));assert.ok(!w.state().sends[0].mail.html.includes('<img src=x'));assert.ok(!w.state().sends[0].mail.html.includes('horizontal-light.png'));
w=worker({failRoleOnce:true});await w.run();assert.equal(w.state().sends.length,0);assert.equal(w.state().profile.role,'artist');await w.run();assert.equal(w.state().creates,1);assert.equal(w.state().profile.role,'partner');assert.equal(w.state().sends.length,1);assert.equal(w.state().sends[0].options.idempotencyKey,'partner/job-fixture');await w.run();assert.equal(w.state().sends.length,1);
w=worker({existingArtist:true});await w.run();assert.equal(w.state().creates,0);assert.equal(w.state().profile.role,'artist');
console.log('PASS: disabled delivery creates no expiring link, unsent expired links refresh, interrupted new account setup recovers without changing existing artists, accepted mail is not resent, dynamic HTML escaped');

for(const kind of ['application','guarantor_request','approved','declined']){
 const w=worker({kind});await w.run();const {mail}=w.state().sends[0];
 assert.equal(mail.from,'Flames Partner <fixture@example.invalid>');
 assert.ok(!/One Flame Records|horizontal-light\.png|brand\/email/i.test(mail.subject+' '+mail.html+' '+mail.text));
 assert.match(mail.html,/Flames Partner/i);
}
// Old saved but never-attempted payloads must not retain the former brand.
for(const kind of ['application','guarantor_request','approved','declined']){
 const w=worker({kind,cached:true});await w.run();const {mail}=w.state().sends[0];assert.notEqual(mail.subject,'Expired');assert.equal(mail.from,'Flames Partner <fixture@example.invalid>');
}
// A possibly accepted send keeps its exact payload and request identity.
w=worker({kind:'application',cached:true,attempted:true});await w.run();assert.equal(w.state().sends[0].mail.subject,'Expired');assert.equal(w.state().sends[0].options.idempotencyKey,'partner/job-fixture');
console.log('PASS: all four Partner mail types use Partner sender/copy/layout, unsent cached wording refreshes, attempted payloads remain stable');

assert.throws(()=>partnerEmail.partnerSender('Bad\r\nBcc: attacker@example.invalid'));
const rendered=partnerEmail.renderPartnerEmail('Safe','Hi https://attacker.example.invalid\nhttps://example.invalid/allowed',['https://example.invalid/allowed']);
assert.ok(!rendered.includes('href="https://attacker.example.invalid'));assert.ok(rendered.includes('href="https://example.invalid/allowed'));
console.log('PASS: programme sender rejects header injection and only trusted generated links become clickable');
