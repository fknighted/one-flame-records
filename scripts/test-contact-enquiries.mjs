// Contact enquiries: isolated PostgreSQL and mocked email provider only.
// No credentials, network, owner data or real emails are used.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import ts from 'typescript';

const TYPES = ['general','studio_session','event','private_hire','press','sync','artist_submission'];

// ── Database: table, checks and admin-only read ─────────────────────────────
const db = new PGlite();
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
for (const file of fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
  if (file.startsWith('20260809')) await db.exec('UPDATE pos_items SET cost_cents=round(cost_cents/100.0)*100 WHERE cost_cents%100<>0');
  try { await db.exec(fs.readFileSync('supabase/migrations/' + file, 'utf8')); }
  catch (e) { console.error('Migration failed:', file, e.message); process.exit(1); }
}
const id = () => crypto.randomUUID();
const scalar = async (sql, args = []) => Object.values((await db.query(sql, args)).rows[0])[0];
const asRole = async (role, sub, claims, fn) => {
  await db.query('SELECT set_config($1,$2,false)', ['request.jwt.claim.sub', sub ?? '']);
  await db.query('SELECT set_config($1,$2,false)', ['request.jwt.claims', claims ?? '']);
  await db.exec(`SET ROLE ${role}`);
  try { return await fn(); } finally { await db.exec('RESET ROLE'); }
};

for (const type of TYPES) {
  await db.query(`INSERT INTO contact_enquiries(enquiry_type,name,email,message) VALUES($1,'Fixture Sender','sender@example.invalid','Fixture message')`, [type]);
}
assert.equal(await scalar('SELECT count(DISTINCT enquiry_type)::int FROM contact_enquiries'), TYPES.length);
assert.equal(await scalar(`SELECT count(*)::int FROM contact_enquiries WHERE admin_email_status='pending' AND reply_email_status='pending'`), TYPES.length);
await assert.rejects(() => db.query(`INSERT INTO contact_enquiries(enquiry_type,name,email,message) VALUES('booking','A','a@example.invalid','m')`), /check/i);
await assert.rejects(() => db.query(`INSERT INTO contact_enquiries(enquiry_type,name,email,message) VALUES('general','','a@example.invalid','m')`), /check/i);
await assert.rejects(() => db.query(`INSERT INTO contact_enquiries(enquiry_type,name,email,message) VALUES('general','A','a@example.invalid',repeat('x',5001))`), /check/i);
await assert.rejects(() => db.query(`UPDATE contact_enquiries SET reply_email_status='maybe'`), /check/i);
console.log('PASS: every enquiry type is saved; unknown types, empty names, long messages and bad email states are refused');

const admin = id(), artist = id(), bartender = id(), factorAdmin = id();
await db.query(`INSERT INTO auth.users(id,email) VALUES($1,'admin@example.invalid'),($2,'artist@example.invalid'),($3,'bar@example.invalid'),($4,'admin2@example.invalid')`, [admin, artist, bartender, factorAdmin]);
await db.query(`UPDATE profiles SET role='admin' WHERE id IN ($1,$2)`, [admin, factorAdmin]);
await db.query(`UPDATE profiles SET role='bartender' WHERE id=$1`, [bartender]);
await db.query(`INSERT INTO auth.mfa_factors(user_id,status) VALUES($1,'verified')`, [factorAdmin]);

await asRole('anon', null, null, async () => {
  await assert.rejects(() => db.query('SELECT * FROM contact_enquiries'), /permission denied/);
  await assert.rejects(() => db.query(`INSERT INTO contact_enquiries(enquiry_type,name,email,message) VALUES('general','A','a@example.invalid','m')`), /permission denied/);
});
for (const user of [artist, bartender]) {
  await asRole('authenticated', user, '{}', async () => {
    assert.equal(await scalar('SELECT count(*)::int FROM contact_enquiries'), 0, 'non-admin accounts see no enquiries');
    await assert.rejects(() => db.query(`INSERT INTO contact_enquiries(enquiry_type,name,email,message) VALUES('general','A','a@example.invalid','m')`), /permission denied/);
  });
}
await asRole('authenticated', admin, '{}', async () => {
  assert.equal(await scalar('SELECT count(*)::int FROM contact_enquiries'), TYPES.length, 'admin reads every enquiry');
  await assert.rejects(() => db.query(`UPDATE contact_enquiries SET name='changed'`), /permission denied/);
  await assert.rejects(() => db.query('DELETE FROM contact_enquiries'), /permission denied/);
});
await asRole('authenticated', factorAdmin, '{"aal":"aal1"}', async () => {
  assert.equal(await scalar('SELECT count(*)::int FROM contact_enquiries'), 0, 'admin with an authenticator must finish the second step');
});
await asRole('authenticated', factorAdmin, '{"aal":"aal2"}', async () => {
  assert.equal(await scalar('SELECT count(*)::int FROM contact_enquiries'), TYPES.length);
});
await db.exec(`RESET request.jwt.claim.sub; RESET request.jwt.claims;`);
console.log('PASS: only administrators (after any second sign-in step) read enquiries; public, artists and bar staff cannot read or write');

await db.query(`INSERT INTO email_studio_templates(key,subject,opening,body,updated_by) VALUES('contact-confirmation','S','O','B',$1)`, [admin]);
await assert.rejects(() => db.query(`INSERT INTO email_studio_templates(key,subject,opening,body,updated_by) VALUES('not-a-template','S','O','B',$1)`, [admin]), /check/i);
console.log('PASS: the contact confirmation is an editable Email Studio template; unknown templates stay refused');

// ── Server action: save, admin email, one confirmation ───────────────────────
function load(file, imports = {}, env = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const m = { exports: {} };
  new Function('require', 'module', 'exports', 'process', code)(name => { if (!(name in imports)) throw new Error(`Unexpected import ${name}`); return imports[name]; }, m, m.exports, { env });
  return m.exports;
}
const ENV = { RESEND_API_KEY: 'isolated-not-a-key', RESEND_FROM_EMAIL: 'noreply@example.invalid', ADMIN_EMAIL: 'label@example.invalid', NEXT_PUBLIC_SITE_URL: 'https://example.invalid' };
const SENDER = 'sender@example.invalid';

let sent = [], saved = [], updates = [], limited = false, saveError = null, failAdmin = false, failReply = false, templateError = null;
class Resend { emails = { send: async (data, options) => {
  sent.push({ data, options });
  const fail = data.to === ENV.ADMIN_EMAIL ? failAdmin : failReply;
  return fail ? { data: null, error: { message: 'fixture provider refusal' } } : { data: { id: 'provider-' + sent.length }, error: null };
} }; }
const service = { from(table) {
  if (table === 'email_studio_templates') return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: null, error: templateError }) };
  assert.equal(table, 'contact_enquiries');
  return {
    insert(row) { this.row = row; return this; },
    select() { return this; },
    single: async function () { if (saveError) return { data: null, error: saveError }; const rid = id(); saved.push({ id: rid, ...this.row }); return { data: { id: rid }, error: null }; },
    update(values) { this.values = values; return this; },
    eq: async function (_col, value) { updates.push({ id: value, ...this.values }); return { error: null }; },
  };
} };
const server = { createServiceClient: () => service, createClient: async () => { throw new Error('public action must not use a session client'); } };
const escape = load('src/lib/email/escape.ts');
const layout = load('src/lib/email/layout.ts', { './escape': escape }, ENV);
const studio = load('src/lib/email/studio.ts', { './escape': escape, './layout': layout });
const managed = load('src/lib/email/managed.ts', { 'server-only': {}, '@/lib/supabase/server': server, './studio': studio });
const send = load('src/lib/email/send.ts', { resend: { Resend } }, ENV);
const enquiries = load('src/lib/contact-enquiries.ts');
const contact = load('src/app/(public)/contact/actions.ts', {
  '@/lib/email/escape': escape, '@/lib/form-limit': { allowPublicForm: async (kind) => { assert.equal(kind, 'contact'); return !limited; } },
  resend: { Resend }, '@/lib/email/layout': layout, '@/lib/email/send': send, '@/lib/email/managed': managed,
  '@/lib/supabase/server': server, '@/lib/contact-enquiries': enquiries,
}, ENV);
const form = (fields = {}) => { const f = new FormData(); for (const [k, v] of Object.entries({ name: 'Fixture <Sender>', email: SENDER, reason: 'general', message: 'Hello from a fixture', ...fields })) f.set(k, v); return f; };
const reset = () => { sent = []; saved = []; updates = []; limited = false; saveError = null; failAdmin = false; failReply = false; templateError = null; };
const quietly = async fn => { const original = console.error; const logged = []; console.error = (...a) => logged.push(a.join(' ')); try { return [await fn(), logged]; } finally { console.error = original; } };

for (const type of TYPES) {
  reset();
  const result = await contact.submitContact(null, form({ reason: type }));
  assert.deepEqual(result, { status: 'success' });
  assert.equal(saved.length, 1); assert.equal(saved[0].enquiry_type, type);
  assert.deepEqual({ name: saved[0].name, email: saved[0].email, message: saved[0].message }, { name: 'Fixture <Sender>', email: SENDER, message: 'Hello from a fixture' });
  const toAdmin = sent.filter(s => s.data.to === ENV.ADMIN_EMAIL), toSender = sent.filter(s => s.data.to === SENDER);
  assert.equal(toAdmin.length, 1, 'admin email still sent once'); assert.equal(toSender.length, 1, 'sender gets exactly one confirmation'); assert.equal(sent.length, 2);
  assert.equal(toAdmin[0].data.replyTo, SENDER);
  assert.equal(toAdmin[0].data.subject, `[One Flame] ${enquiries.ENQUIRY_TYPES[type]} — Fixture <Sender>`);
  assert(toAdmin[0].data.html.includes('Fixture &lt;Sender&gt;') && !toAdmin[0].data.html.includes('<Sender>'));
  assert.equal(toAdmin[0].options.idempotencyKey, `contact-admin/${saved[0].id}`);
  assert.equal(toSender[0].options.idempotencyKey, `contact-reply/${saved[0].id}`);
  assert.equal(toSender[0].data.subject, 'We received your message — One Flame Records');
  for (const part of [toSender[0].data.html, toSender[0].data.text]) assert(!part.includes('Fixture') && !part.includes('Hello from a fixture'), 'confirmation never repeats public-typed text');
  assert.deepEqual(updates, [{ id: saved[0].id, admin_email_status: 'sent', reply_email_status: 'sent' }]);
}
console.log('PASS: each enquiry type is saved, the label email still goes out, and the sender gets one confirmation with no echoed text');

// Validation, honeypot and rate limit are unchanged and save/send nothing.
const refusals = [
  [{ website: 'bot' }, { status: 'success' }],
  [{ name: '' }, { status: 'error', message: 'Please fill in all required fields.' }],
  [{ message: '   ' }, { status: 'error', message: 'Please fill in all required fields.' }],
  [{ email: 'not-an-email' }, { status: 'error', message: 'Please enter a valid email address.' }],
  [{ reason: 'booking' }, { status: 'error', message: 'Use a valid reason, a name up to 100 characters and a message up to 5,000 characters.' }],
  [{ reason: 'toString' }, { status: 'error', message: 'Use a valid reason, a name up to 100 characters and a message up to 5,000 characters.' }],
  [{ name: 'x'.repeat(101) }, { status: 'error', message: 'Use a valid reason, a name up to 100 characters and a message up to 5,000 characters.' }],
  [{ message: 'x'.repeat(5001) }, { status: 'error', message: 'Use a valid reason, a name up to 100 characters and a message up to 5,000 characters.' }],
];
for (const [fields, expected] of refusals) {
  reset();
  assert.deepEqual(await contact.submitContact(null, form(fields)), expected);
  assert.equal(saved.length + sent.length, 0);
}
reset(); limited = true;
assert.deepEqual(await contact.submitContact(null, form()), { status: 'error', message: 'Please wait before sending another message.' });
assert.equal(saved.length + sent.length, 0);
console.log('PASS: honeypot, required fields, email format, reason list, length limits and rate limit unchanged; nothing saved or sent');

// A failed save is never silent: the sender sees the existing error and no email goes out.
reset(); saveError = { message: 'fixture database unavailable' };
let [result, logged] = await quietly(() => contact.submitContact(null, form()));
assert.deepEqual(result, { status: 'error', message: 'Failed to send your message. Please try again.' });
assert.equal(sent.length, 0); assert(logged.some(l => l.includes('save failed')));
// After a save, email problems are recorded on the enquiry instead of inviting a duplicate.
reset(); failAdmin = true;
[result, logged] = await quietly(() => contact.submitContact(null, form()));
assert.deepEqual(result, { status: 'success' }); assert.equal(sent.filter(s => s.data.to === SENDER).length, 1);
assert.deepEqual(updates[0], { id: saved[0].id, admin_email_status: 'failed', reply_email_status: 'sent' }); assert(logged.length > 0);
reset(); failReply = true;
[result] = await quietly(() => contact.submitContact(null, form()));
assert.deepEqual(result, { status: 'success' }); assert.equal(sent.filter(s => s.data.to === SENDER).length, 1, 'no automatic retry of the confirmation');
assert.deepEqual(updates[0], { id: saved[0].id, admin_email_status: 'sent', reply_email_status: 'failed' });
reset(); templateError = { message: 'fixture wording lookup failed' };
[result] = await quietly(() => contact.submitContact(null, form()));
assert.deepEqual(result, { status: 'success' }); assert.equal(sent.filter(s => s.data.to === SENDER).length, 0, 'saved owner wording is never replaced by defaults');
assert.deepEqual(updates[0], { id: saved[0].id, admin_email_status: 'sent', reply_email_status: 'failed' });
console.log('PASS: failed save shows the existing error and sends nothing; email failures after saving are recorded, not retried or hidden');

// ── Admin list page: guard first, then read through the signed-in session ───
const calls = [];
let allowed = false;
const page = load('src/app/admin/enquiries/page.tsx', {
  'react/jsx-runtime': { jsx: () => null, jsxs: () => null, Fragment: 'fragment' },
  'next/link': { default: () => null },
  '@/lib/auth': { requireAdmin: async () => { calls.push('guard'); if (!allowed) throw new Error('Forbidden'); } },
  '@/lib/supabase/server': { createServiceClient: () => { throw new Error('admin list must not bypass row-level security'); }, createClient: async () => ({ from(table) { calls.push(table); const q = { select() { return q; }, order() { return q; }, limit() { return q; }, eq(col, v) { calls.push(`${col}=${v}`); return q; }, then(r) { r({ data: [], error: null }); } }; return q; } }) },
  '@/lib/bar/pos': { jamaicaDateTime: v => v },
  '@/lib/contact-enquiries': enquiries,
});
await assert.rejects(() => page.default({ searchParams: Promise.resolve({}) }), /Forbidden/);
assert.deepEqual(calls, ['guard'], 'no database read before the admin check');
calls.length = 0; allowed = true;
await page.default({ searchParams: Promise.resolve({ type: 'private_hire' }) });
assert.deepEqual(calls, ['guard', 'contact_enquiries', 'enquiry_type=private_hire']);
calls.length = 0;
await page.default({ searchParams: Promise.resolve({ type: 'not-a-type' }) });
assert.deepEqual(calls, ['guard', 'contact_enquiries'], 'unknown filters are ignored');
console.log('PASS: the admin list checks the administrator first and reads only through the signed-in, rule-checked session');
