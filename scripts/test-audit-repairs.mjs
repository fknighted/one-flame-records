// An isolated PostgreSQL engine: no credentials, network, owner data or emails.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const db=new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE SCHEMA storage;
CREATE TABLE auth.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text,raw_user_meta_data jsonb DEFAULT '{}');
CREATE TABLE auth.mfa_factors(user_id uuid,status text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role',true),''),'service_role') $$;
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
CREATE TABLE storage.buckets(id text PRIMARY KEY,file_size_limit bigint,allowed_mime_types text[]);
INSERT INTO storage.buckets(id) VALUES('public-media'),('private-assets'),('generated-videos');
GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon,authenticated,service_role;`);
for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()){
 try{
  if(file.startsWith('20260809'))await db.exec('UPDATE pos_items SET cost_cents=round(cost_cents/100.0)*100 WHERE cost_cents%100<>0');
  await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
 }catch(e){console.error('Migration failed:',file,e.message);throw e;}
}
console.log('PASS: full migration history and all audit migrations execute in PostgreSQL');
const id=()=>crypto.randomUUID();
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];
const actor=id(),artistUser=id(),artist=id(),item=id(),tab=id();
await db.query(`INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES($1,'staff@example.invalid','{"role":"admin"}'),($2,'artist@example.invalid','{}')`,[actor,artistUser]);
assert.equal(await scalar('SELECT role FROM profiles WHERE id=$1',[actor]),'artist','metadata must never grant admin');
await db.query(`UPDATE profiles SET role='admin' WHERE id=$1`,[actor]);
await db.query(`INSERT INTO artists(id,stage_name,legal_name,slug,status) VALUES($1,'Fixture','Private name','fixture','active')`,[artist]);
await db.query(`UPDATE profiles SET artist_id=$1 WHERE id=$2`,[artist,artistUser]);
await db.query(`INSERT INTO pos_items(id,name,category,price_jmd,cost_jmd,stock_quantity) VALUES($1,'Fixture item','drink',250,100,10)`,[item]);
await db.query(`INSERT INTO pos_tabs(id,name) VALUES($1,'Isolated fixture')`,[tab]);
const op=async(operation,payload={},request=id())=>{await db.query('SELECT bar_apply_operation($1,$2,$3,$4,$5)',[request,actor,tab,operation,JSON.stringify(payload)]);return request;};
const request=await op('add',{item_id:item});
await op('add',{item_id:item},request);
assert.equal(await scalar('SELECT total_jmd FROM pos_tabs WHERE id=$1',[tab]),250);
assert.equal(await scalar('SELECT stock_quantity FROM pos_items WHERE id=$1',[item]),9);
assert.equal(await scalar('SELECT count(*)::int FROM pos_tab_items WHERE tab_id=$1',[tab]),1);
await assert.rejects(()=>op('custom',{price:300},request),/already used/);
const line=await scalar('SELECT id FROM pos_tab_items WHERE tab_id=$1',[tab]);
await op('increment',{tab_item_id:line});await op('decrement',{tab_item_id:line});await op('remove',{tab_item_id:line});
await assert.rejects(()=>op('remove',{tab_item_id:line}),/no longer exists/);
assert.equal(await scalar('SELECT stock_quantity FROM pos_items WHERE id=$1',[item]),10);
assert.equal(await scalar('SELECT total_jmd FROM pos_tabs WHERE id=$1',[tab]),0);
// A ledger failure must roll back stock, quantity, and total together.
await op('add',{item_id:item});const second=await scalar('SELECT id FROM pos_tab_items WHERE tab_id=$1',[tab]);
await db.exec(`CREATE FUNCTION fail_void() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture ledger failure'; END $$; CREATE TRIGGER fixture_void BEFORE INSERT ON pos_voids FOR EACH ROW EXECUTE FUNCTION fail_void();`);
await assert.rejects(()=>op('remove',{tab_item_id:second}),/fixture ledger failure/);
assert.equal(await scalar('SELECT stock_quantity FROM pos_items WHERE id=$1',[item]),9);
assert.equal(await scalar('SELECT total_jmd FROM pos_tabs WHERE id=$1',[tab]),250);
await db.exec('DROP TRIGGER fixture_void ON pos_voids');
await op('close',{payment_method:'cash',tip_jmd:10});await assert.rejects(()=>op('add',{item_id:item}),/already closed/);
console.log('PASS: sale retries, receipt misuse, quantity/remove, duplicate removal, rollback, add-after-close');
// Verify actual permissions, not a text search for REVOKE.
for(const role of ['anon','authenticated']){
 await db.exec(`SET ROLE ${role}`);
 await assert.rejects(()=>db.query('SELECT legal_name FROM artists'),/permission denied/);
 assert.equal(await scalar('SELECT stage_name FROM artists LIMIT 1'),'Fixture');
 await assert.rejects(()=>db.query('SELECT increment_tab_total(NULL,0)'),/permission denied/);
 await assert.rejects(()=>db.query('SELECT bar_apply_operation($1,$2,$3,$4,$5)',[id(),actor,tab,'add','{}']),/permission denied/);
 await assert.rejects(()=>db.query("INSERT INTO signup_applications(code_id,stage_name,legal_name,email) VALUES(NULL,'x','x','x')"),/row-level security|permission denied/);
 await db.exec('RESET ROLE');
}
await db.query('SELECT set_config($1,$2,false)',['request.jwt.claim.sub',actor]);
await db.exec(`INSERT INTO auth.mfa_factors VALUES('${actor}','verified')`);
assert.equal(await scalar('SELECT is_admin()'),false);
assert.equal(await scalar('SELECT is_bar_staff()'),false);
await db.exec('SET ROLE authenticated');
await assert.rejects(()=>db.query('UPDATE pos_tabs SET total_jmd=999 WHERE id=$1',[tab]),/permission denied/);
await assert.rejects(()=>db.query('DELETE FROM assets WHERE id=$1',[id()]),/permission denied/);
await db.exec('RESET ROLE');
await db.query('SELECT set_config($1,$2,false)',['request.jwt.claims','{"aal":"aal2"}']);assert.equal(await scalar('SELECT is_admin()'),true);
await db.exec('RESET request.jwt.claim.sub; RESET request.jwt.claims;');
console.log('PASS: legal-name column privacy, public mutation denial, untrusted signup role, enrolled-admin assurance');
// Expired QR code and repeat submissions are enforced inside the database.
const code=id();await db.query(`INSERT INTO signup_codes(id,code,label,is_active) VALUES($1,'fixture','Fixture',false)`,[code]);
const application={code_id:code,stage_name:'Fixture applicant',legal_name:'Fixture legal',email:'applicant@example.invalid',genres:[],socials:{}};
await assert.rejects(()=>db.query('SELECT submit_artist_application($1)',[JSON.stringify(application)]),/expired/);
await db.query('UPDATE signup_codes SET is_active=true WHERE id=$1',[code]);
const app=await scalar('SELECT submit_artist_application($1)',[JSON.stringify(application)]);
assert.equal(await scalar('SELECT submit_artist_application($1)',[JSON.stringify(application)]),null);
await db.query('SELECT claim_application($1)',[app]);await assert.rejects(()=>db.query('SELECT claim_application($1)',[app]),/already running/);
await db.query('UPDATE signup_applications SET approval_lease_until=NULL WHERE id=$1',[app]);
const applicant=id();await db.query("INSERT INTO auth.users(id,email) VALUES($1,'applicant@example.invalid')",[applicant]);
await db.query('SELECT claim_application($1)',[app]);
await db.query('SELECT finish_application($1,$2,$3)',[app,applicant,actor]);
assert.equal(await scalar('SELECT status FROM signup_applications WHERE id=$1',[app]),'approved');
assert(await scalar('SELECT artist_id IS NOT NULL FROM profiles WHERE id=$1',[applicant]));
console.log('PASS: QR rotation, duplicate application, approval claim exclusion and recovered-account finalization');
const reservation=id();
await db.query("INSERT INTO upload_reservations(id,owner_id,artist_id,purpose,kind,bucket,path,mime_type,size_bytes) VALUES($1,$2,$3,'asset','demo','private-assets','fixture/demo.mp3','audio/mpeg',10)",[reservation,artistUser,artist]);
const assetId=await scalar('SELECT finalize_asset_upload($1,$2,$3,$4,$5)',[reservation,artistUser,'Fixture demo',null,null]);
assert.equal(await scalar('SELECT finalize_asset_upload($1,$2,$3,$4,$5)',[reservation,artistUser,'Fixture demo',null,null]),assetId);
await db.query('SELECT delete_asset_record($1,$2)',[assetId,artist]);
await assert.rejects(()=>db.query('SELECT finalize_asset_upload($1,$2,$3,$4,$5)',[reservation,artistUser,'Recreated',null,null]),/removed/);
assert.equal(await scalar("SELECT count(*)::int FROM storage_cleanup_queue WHERE path='fixture/demo.mp3'"),1);
console.log('PASS: upload finalization retry, atomic record/cleanup, deleted-upload replay denial');
// Reactivation requires the recipient's unexpired one-time confirmation.
await db.exec(`INSERT INTO fan_subscribers(email,status) VALUES('subscriber@example.invalid','unsubscribed'); INSERT INTO newsletter_confirmations VALUES('subscriber@example.invalid','fixturehash',now()+interval '1 hour');`);
assert.equal(await scalar("SELECT confirm_newsletter('subscriber@example.invalid','wrong')"),false);
assert.equal(await scalar("SELECT confirm_newsletter('subscriber@example.invalid','fixturehash')"),true);
assert.equal(await scalar("SELECT confirm_newsletter('subscriber@example.invalid','fixturehash')"),false);
const run=id();await db.query('SELECT prepare_newsletter($1,$2,$3,$4)',[run,'Fixture subject','Fixture body',actor]);
await db.query('SELECT prepare_newsletter($1,$2,$3,$4)',[run,'Fixture subject','Fixture body',actor]);
assert.equal(await scalar('SELECT count(*)::int FROM newsletter_deliveries WHERE run_id=$1',[run]),1);
assert.equal((await db.query('SELECT * FROM claim_newsletter_batch($1)',[run])).rows.length,1);
assert.equal((await db.query('SELECT * FROM claim_newsletter_batch($1)',[run])).rows.length,0);
await db.query("UPDATE newsletter_deliveries SET first_attempt_at=now()-interval '25 hours',claimed_at=now()-interval '25 hours' WHERE run_id=$1",[run]);
assert.equal((await db.query('SELECT * FROM claim_newsletter_batch($1)',[run])).rows.length,0);
assert.equal(await scalar('SELECT status FROM newsletter_deliveries WHERE run_id=$1',[run]),'uncertain');
// Releasing an unattempted reclaimed row must not extend its original retry window.
await db.query("UPDATE newsletter_deliveries SET status='pending',claimed_at=null WHERE run_id=$1",[run]);
assert.equal((await db.query('SELECT * FROM claim_newsletter_batch($1)',[run])).rows.length,0);
assert.equal(await scalar('SELECT status FROM newsletter_deliveries WHERE run_id=$1',[run]),'uncertain');
console.log('PASS: recipient confirmation/reactivation, replay denial, snapshot without duplication, claim exclusion, expired retry quarantine');
await db.close();
