import {createRequire} from 'node:module';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const sdkRequire=createRequire(require.resolve('inngest'));
const {z}=sdkRequire('zod/v3');
for(const kind of ['array','set','map'])test(`rejects oversized ${kind} before validating elements`,()=>{
 let calls=0;const item=z.any().superRefine(()=>{calls++;});
 const schema=kind==='array'?z.array(item):kind==='set'?z.set(item):z.map(z.any(),item);
 const entries=Array.from({length:4097},(_,i)=>i);
 const value=kind==='array'?entries:kind==='set'?new Set(entries):new Map(entries.map(i=>[i,i]));
 assert.equal(schema.safeParse(value).success,false);assert.equal(calls,0);
});
test('honors explicit limits before elements and preserves ordinary valid data',async()=>{
 let calls=0;const schema=z.array(z.any().superRefine(()=>{calls++;})).max(2);
 assert.equal((await schema.safeParseAsync([1,2,3])).success,false);assert.equal(calls,0);
 const value={events:[{name:'fixture/check',data:{requestId:'fixture'}}]};
 assert.deepEqual(z.object({events:z.array(z.object({name:z.string(),data:z.record(z.any())}))}).parse(value),value);
});
test('bounds actual SDK ESM compatibility parser',async()=>{
 const {pathToFileURL}=await import('node:url');const esm=await import(pathToFileURL(sdkRequire.resolve('zod/v3').replace(/\.cjs$/,'.js')));let calls=0;
 const item=esm.z.any().superRefine(()=>{calls++;});
 for(const[schema,value]of [[esm.z.array(item),Array(4097).fill(1)],[esm.z.set(item),new Set(Array.from({length:4097},(_,i)=>i))],[esm.z.map(esm.z.any(),item),new Map(Array.from({length:4097},(_,i)=>[i,i]))]]){assert.equal((await schema.safeParseAsync(value)).success,false);assert.equal(calls,0);}
});
test('real SDK rejects unsigned callbacks and executes valid signed payload offline',async()=>{
 const {Inngest}=await import('inngest'),{serve}=await import('inngest/next'),{createHmac}=await import('node:crypto');
 const {NextRequest}=await import('next/server.js');
 const previous=process.env.INNGEST_SIGNING_KEY;process.env.INNGEST_SIGNING_KEY='signkey-test-synthetickey';let calls=0;
 try{
 const client=new Inngest({id:'repair-fixture',isDev:false,fetch:async()=>{throw Error('No external provider allowed.');}});
 const fixture=client.createFunction({id:'compat',triggers:[{event:'fixture/check'}]},async({event})=>{calls++;return {ok:true,value:event.data.value};});
 const handlers=serve({client,functions:[fixture]});
 const body={event:{name:'fixture/check',data:{value:'retained'}},events:[{name:'fixture/check',data:{value:'retained'}}],steps:{},ctx:{attempt:0,run_id:'fixture-run',use_api:false}};
 function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.entries(v).sort(([a],[b])=>a.localeCompare(b)).map(([k,value])=>JSON.stringify(k)+':'+canonical(value)).join(',')+'}';return JSON.stringify(v)??'null';}
 const timestamp=String(Math.floor(Date.now()/1000)),signature=createHmac('sha256','synthetickey').update(canonical(body)+timestamp).digest('hex');
 const input=signed=>new NextRequest('http://localhost/api/inngest?fnId=repair-fixture-compat',{method:'POST',headers:{'Content-Type':'application/json',...(signed?{'x-inngest-signature':`t=${timestamp}&s=${signature}`}:{})},body:JSON.stringify(body)});
 assert.equal((await handlers.POST(input(false),undefined)).status,401);assert.equal(calls,0);
 const response=await handlers.POST(input(true),undefined);assert.equal(response.status,200);assert.deepEqual(await response.json(),{ok:true,value:'retained'});assert.equal(calls,1);
 }finally{if(previous===undefined)delete process.env.INNGEST_SIGNING_KEY;else process.env.INNGEST_SIGNING_KEY=previous;}
});
