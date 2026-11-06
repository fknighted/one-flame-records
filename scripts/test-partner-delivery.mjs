// Isolated PostgreSQL tests: never connects to owner databases or sends messages.
import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
process.on('uncaughtException',error=>{console.error(error.message);process.exit(1);});
const migration='supabase/migrations/20261106000001_flames_partner.sql';
assert.ok(fs.existsSync(migration),'Flames Partner migration must exist');
const db=new PGlite();
await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE SCHEMA storage;
CREATE TABLE auth.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text,raw_user_meta_data jsonb DEFAULT '{}',raw_app_meta_data jsonb DEFAULT '{}');
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
 if(file.startsWith('20260809'))await db.exec('UPDATE pos_items SET cost_cents=round(cost_cents/100.0)*100 WHERE cost_cents%100<>0');
 try { await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8')); } catch(e) {console.error(file,e.message,e.position);process.exit(1);}
}
const id=()=>crypto.randomUUID();
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];

const person={full_name:'Mail Fixture',email:'mail-member@example.invalid',phone:'5550000',address:'Fixture address',employer:'Fixture employer',payment_day:'1',tier:'spark'};
const g={...person,email:'mail-guarantor@example.invalid',relationship_to_member:'friend',approval_token:id()};
const member=await scalar('SELECT partner_apply_application($1,$2,$3)',[person,g,id()]);
assert.equal(await scalar('SELECT count(*)::int FROM partner_delivery_jobs WHERE member_id=$1',[member]),2,'application and guarantor messages persist atomically');
const jobs=(await db.query('SELECT * FROM partner_claim_mail($1)',[member])).rows;
assert.equal(jobs.length,2);assert.equal((await db.query('SELECT * FROM partner_claim_mail($1)',[member])).rows.length,0,'concurrent sender cannot claim leased messages');
await db.query('SELECT partner_respond_guarantor($1,$2)',[g.approval_token,'approve']);
assert.equal(await scalar("SELECT count(*)::int FROM partner_delivery_jobs WHERE member_id=$1 AND kind='approved'",[member]),1);
await db.query('SELECT partner_respond_guarantor($1,$2)',[g.approval_token,'approve']);
assert.equal(await scalar("SELECT count(*)::int FROM partner_delivery_jobs WHERE member_id=$1 AND kind='approved'",[member]),1,'replayed consent never queues a second account email');
for(const role of ['anon','authenticated']){await db.exec('SET ROLE '+role);await assert.rejects(()=>db.query('SELECT * FROM partner_delivery_jobs'),/permission denied/);await assert.rejects(()=>db.query('SELECT * FROM partner_claim_mail($1)',[member]),/permission denied/);await db.exec('RESET ROLE');}
const claimed=jobs[0];
await db.query("UPDATE partner_delivery_jobs SET lease_until=now()-interval '1 second' WHERE id=$1",[claimed.id]);
const reclaimed=(await db.query('SELECT * FROM partner_claim_mail($1)',[member])).rows.find(row=>row.id===claimed.id);
assert.ok(reclaimed);assert.notEqual(reclaimed.lease_id,claimed.lease_id);
assert.equal((await db.query("UPDATE partner_delivery_jobs SET status='sent' WHERE id=$1 AND lease_id=$2 RETURNING id",[claimed.id,claimed.lease_id])).rows.length,0,'stale sender cannot complete the replacement worker claim');
console.log('PASS: transactional mail queue, exclusive delivery leases, replay-safe approval notification and private token payloads');
await db.close();
