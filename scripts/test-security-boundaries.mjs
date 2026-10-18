import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import { Marked } from 'marked';
import * as crypto from 'node:crypto';
function load(file,imports={},env={}){
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const m={exports:{}};
 new Function('require','module','exports','process','Buffer',code)(name=>{if(!(name in imports))throw new Error(`Unexpected import ${name}`);return imports[name];},m,m.exports,{env},Buffer);
 return m.exports;
}
const escaped=load('src/lib/email/escape.ts').escapeHtml;
assert.equal(escaped('<a href="x">&\'</a>'),'&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
const markdown=load('src/lib/email/markdown.ts',{'marked':{Marked},'./escape':{escapeHtml:escaped}});
const html=await markdown.renderSafeMarkdown('<img src=x onerror=alert(1)>\n\n[bad](javascript:alert(1))\n\n**Good** [music](https://example.invalid/music)');
assert(!html.includes('<img src=x'));assert(!html.includes('href="javascript:'));assert(html.includes('<strong>Good</strong>'));assert(html.includes('https://example.invalid/music'));
const tokens=load('src/lib/email/newsletter-token.ts',{'server-only':{},'node:crypto':crypto},{NEWSLETTER_TOKEN_SECRET:'isolated-fixture-key'});
const confirm=tokens.newsletterToken('fixture@example.invalid','confirm','one-use');
assert.equal(tokens.verifyNewsletterToken(confirm,'confirm'),'fixture@example.invalid');
assert.equal(tokens.verifyNewsletterToken(confirm,'unsubscribe'),null);
assert.equal(tokens.verifyNewsletterToken(confirm+'tampered','confirm'),null);
const unsubscribe=tokens.newsletterToken('fixture@example.invalid','unsubscribe');
assert.equal(tokens.verifyNewsletterToken(unsubscribe,'unsubscribe'),'fixture@example.invalid');
let assurance={currentLevel:'aal1',nextLevel:'aal2'};let role='admin';
const client={auth:{getUser:async()=>({data:{user:{id:'fixture'}}}),mfa:{getAuthenticatorAssuranceLevel:async()=>({data:assurance})}},from:()=>({select(){return this;},eq(){return this;},single:async()=>({data:{role}})})};
const auth=load('src/lib/auth.ts',{'@/lib/supabase/server':{createClient:async()=>client},'next/navigation':{redirect:path=>{throw new Error('redirect:'+path);}}});
await assert.rejects(()=>auth.requireAdmin(),/redirect:\/auth\/mfa/);
assurance={currentLevel:'aal2',nextLevel:'aal2'};await auth.requireAdmin();
role='artist';await assert.rejects(()=>auth.requireAdmin(),/Forbidden/);
console.log('PASS: email/Markdown injection, token tampering/scope, admin second-step and non-admin action denial');
// Changing the kind after a validation failure must prepare a matching upload,
// not trap the artist in a permanently mismatched old reservation.
const preparedKinds=[];let responses=0;
const hooks={useRef:()=>({current:null}),useCallback:fn=>fn};
const uploads=load('src/lib/uploads/use-upload-action.ts',{'react':hooks,'./actions':{prepareUpload:async input=>{preparedKinds.push(input.kind);return {id:'fixture-'+preparedKinds.length,signedUrl:'https://upload.example.invalid'};}}});
const originalFetch=globalThis.fetch;globalThis.fetch=async()=>({ok:true});
try{
 const action=uploads.useUploadAction(async()=>++responses===1?{error:'Title required'}:null,'asset');
 const file=new File(['fixture'],'fixture.mp3',{type:'audio/mpeg',lastModified:1});
 for(const kind of ['demo','instrumental']){const form=new FormData();form.set('file',file);form.set('kind',kind);await action(null,form);}
 assert.deepEqual(preparedKinds,['demo','instrumental']);
}finally{globalThis.fetch=originalFetch;}
console.log('PASS: changing upload kind after validation failure prepares a new reservation');
const retryable=load('src/lib/retryable-action.ts',{'react':hooks});
const identities=[];let attempts=0;
const retry=retryable.useRetryableAction(async(_previous,data)=>{identities.push(data.get('request_id'));return ++attempts===1?{error:'Unknown transport outcome'}:null;});
await retry(null,new FormData());await retry(null,new FormData());await retry(null,new FormData());
assert.equal(identities[0],identities[1]);assert.notEqual(identities[1],identities[2]);
console.log('PASS: ambiguous bar response keeps its identity; a successful response starts a fresh operation');
