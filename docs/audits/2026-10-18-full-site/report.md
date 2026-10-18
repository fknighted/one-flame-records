# One Flame website audit — October 18, 2026

The website is available and its current public speed measurements look good. Security and recordkeeping need attention before more design or speed work. The most serious confirmed issue is that anonymous callers can run database functions intended to change bar records. Artists’ legal names are also readable through the public database interface.

A separate, potentially critical issue appears in the account-creation code: it accepts a role supplied by the person registering, including `admin`. Public email registration is enabled on the live project. The current database trigger could not be retrieved, and no account was created, so exploitation of that path is **not established live**. Treat confirmation and containment as urgent.

This was an audit and recommendation task. No application source, hosted settings, existing business records, media, account permissions or deployment was changed. Reports and a short project-memory note are the only intended project edits. Database function probes used null row identifiers; none could match an existing record. No real email, registration, cash transaction, upload, publication or external worker job was triggered.

## Scope and evidence

- Live website: `https://www.oneflamerecords.com`, Vercel project `one-flame-records` in the existing owner account.
- Serving deployment: `dpl_9rsJ5ZKo5z5AJN5JN4oxX2cTJyi8`, Ready, October 9, 2026. Deployment Git revision matches local application HEAD `d87e115be8897e70aa75c52e9d47e0a88de76d46`. The hosted build confirms Next.js 16.3.8; hosting uses Node 24.x. Local checks ran with Node 22.22.3, a verification difference to standardize.
- Reviewed public pages, sign-in/recovery code, admin/artist/bar action paths, database migrations, private media, newsletter/contact delivery code, background YouTube uploads, monitoring and continuity records.
- Safe HTTP checks covered 21 paths. All 18 URLs advertised by the live sitemap returned 200. Signed-out admin, portal and bar routes redirected to login. Missing-page handling returned 404.
- Browser checks at 390-pixel phone width covered the homepage, roster, Kahlic, releases, videos, news, about, contact, sign, search, login and missing page. The phone menu opened and the Lounge link worked. Desktop homepage and catalog were inspected at 1440 pixels. No horizontal page overflow was found on measured routes. Settled pages showed no broken loaded images; this does not certify every media file.
- Live database reads checked anonymous access, content/cost coverage and every current tab against every line item. No names, emails, credentials or individual customer amounts were saved in evidence.
- Type checking, production build and the existing Studio-retirement regression script passed. Lint failed with 4 errors and 24 warnings. Production package audit returned no known vulnerabilities; full audit reported five affected development packages tracing to one underlying `braces` advisory.
- Research was performed sequentially by one agent under the audit skill’s Codex adaptation. This is not an independent second review.

Evidence: [deployment](deployment-check.json), [HTTP](http-checks.json), [sitemap](sitemap-checks.json), [phone measurements](phone-checks.json), [database checks](database-checks.json), [content checks](content-checks.json), [performance](performance-checks.json), [production packages](production-dependency-audit.json), [all packages](dependency-audit.json), [build](local-build.log), [limits](verification-limits.json), [desktop image](desktop-home.png), [phone Lounge image](phone-lounge.png).

## Repair first: access and private information

### 1. Bar-changing database functions accept anonymous calls — high, confirmed live

**Problem and effect:** Staff screens check roles, but the database interface exposes functions that bypass those screens and run with the database owner’s rights. A caller who obtains a matching row identifier can change tab totals, quantities or stock without staff authorization. Random identifiers are not an access-control boundary.

**Evidence:** Anonymous calls to `increment_tab_total`, `decrement_tab_total`, both tab-quantity functions and three stock functions returned success with null identifiers. The stock-purchase function reached its own “item not found” logic rather than denying access. The retained gamer-balance function was callable too. No matching row was supplied. The migration bodies are `SECURITY DEFINER` and contain no caller role checks. See [supabase/migrations/20260623000001_tab_item_quantity_rpcs.sql:2](</Users/frankknight/Claude OS/Projects/one flame app/supabase/migrations/20260623000001_tab_item_quantity_rpcs.sql:2>), `20260622000001_atomic_stock_and_tab_total.sql:3`, `20260716000006_whole_bottle_items.sql:15`, `20260716000008_pos_voids_and_stock_restore.sql:17`, and `20260809000001_money_cents_to_dollars.sql:108`.

**Change:** Write a new migration restricting these app-internal functions to the service role. Revoke both inherited PUBLIC execution and explicit `anon`/`authenticated` grants; pin function search paths and review all privileged functions. Do not blanket-revoke helpers required by row policies. Verify anonymous and artist calls fail and authorized bar actions still work. Supabase explains the [default function permissions and required revocations](https://supabase.com/docs/guides/database/functions).

**Limit:** Actual unauthorized modification was deliberately not performed. Live permission exposure is confirmed; current function bodies were checked against source and the existing August schema backup, rather than newly retrieved live definitions.

### 2. Registration code trusts a self-selected admin role — potentially critical, urgent live verification

**Problem and effect:** `handle_new_user()` reads `new.raw_user_meta_data->>'role'` and permits `admin` and `bartender`. User metadata is supplied during normal account creation. If this trigger is still live, a person registering their own confirmed email can obtain a privileged profile without label approval. The later privileged-column guard protects updates, not this trigger’s initial insert.

**Evidence:** [supabase/migrations/20260617000001_pos_and_gaming.sql:11–25](</Users/frankknight/Claude OS/Projects/one flame app/supabase/migrations/20260617000001_pos_and_gaming.sql:11>); the August 15 schema backup contains the same trigger. Live `/auth/v1/settings` reports email registration enabled and email confirmation required. No later migration replaces this trigger in the repository.

**Change:** Confirm the live trigger immediately. Public registration must always create an unprivileged profile; trusted admin actions should assign staff roles separately after authorization. Consider closing unused public auth registration while preserving the existing invitation flow. Review privileged accounts for unexpected creation.

**Limit:** No test user or verification email was created. Management access rejected the saved access token, and direct database metadata inspection stopped at certificate verification. Therefore this report does not claim a demonstrated live account takeover.

### 3. Public database reads reveal artists’ legal names — high, confirmed live

**Problem and effect:** The public policy filters artist rows by active status but does not hide private columns. An anonymous client can ask for `legal_name` even though the public page displays stage names.

**Evidence:** Anonymous `artists.select('legal_name')` returned nine active rows, eight containing a legal name. Only counts were recorded. See [supabase/migrations/20260513154209_add_rls_policies.sql:44](</Users/frankknight/Claude OS/Projects/one flame app/supabase/migrations/20260513154209_add_rls_policies.sql:44>) and the `artists` table definition.

**Change:** Put legal identity in a private table, or enforce column permissions and expose a deliberately limited public view. Update public readers accordingly. Recheck the public metadata of assets and saved video jobs for other internal fields; their row-publication policies likewise do not limit columns. A frontend-only change to selected fields will not fix direct database access.

### 4. Admin second-step sign-in is offered but not enforced — high, confirmed in source

**Problem and effect:** The settings page can enroll an authenticator, but login immediately navigates to admin after password sign-in. Neither the proxy nor `requireAdmin()` checks that the second step was completed. An enrolled administrator can therefore still reach service-backed admin operations using a password-only session under this application logic.

**Evidence:** [src/app/login/page.tsx:38](</Users/frankknight/Claude OS/Projects/one flame app/src/app/login/page.tsx:38>), [src/proxy.ts:47](</Users/frankknight/Claude OS/Projects/one flame app/src/proxy.ts:47>), [src/lib/auth.ts:10](</Users/frankknight/Claude OS/Projects/one flame app/src/lib/auth.ts:10>), [src/app/admin/settings/MFASection.tsx](</Users/frankknight/Claude OS/Projects/one flame app/src/app/admin/settings/MFASection.tsx>). No assurance-level enforcement was found in application guards or migrations.

**Change:** Add a real challenge screen and enforce the required authentication level at server authorization boundaries, including actions that use the service client. Cover direct database access too. Validate using an enrolled admin with password-only and fully verified sessions. [Supabase’s guidance](https://supabase.com/docs/guides/auth/auth-mfa) distinguishes enrollment from enforcement.

**Limit:** No administrator session was available; current enrollment and any manually added live policies remain unknown.

## Repair next: money, uploads and customer workflows

### 5. Bar updates can save only part of a sale — high, confirmed in source

**Problem and effect:** Adding/removing an item, adjusting stock, changing totals and logging cancellations are separate database calls. A failure or concurrent action can leave these records disagreeing. Current totals are clean; that does not make these operations safe under races.

**Reproducible sequence:** Two remove requests read the same line before either deletes it. Each delete succeeds, including the one that deletes zero rows; each request restores stock, logs a cancellation and reduces the total. Another sequence closes a tab after an add request checks its status but before `increment_tab_total`, which only updates open tabs. The line and stock may change while the closed tab total does not. Decrementing a quantity-one line also ignores deletion errors before restoring stock.

**Evidence:** [src/app/bar/tabs/[id]/actions.ts:131](</Users/frankknight/Claude OS/Projects/one flame app/src/app/bar/tabs/[id]/actions.ts:131>) onward, particularly `removeTabItem`, `decrementTabItem` and `closeTab`; total functions in `20260809000001_money_cents_to_dollars.sql:108`. Stock purchase logging is also best-effort after a successful stock change in [src/lib/bar/inventory.ts:77](</Users/frankknight/Claude OS/Projects/one flame app/src/lib/bar/inventory.ts:77>).

**Change:** Move each complete business operation into a database transaction with a locked tab/line, status checks inside the transaction, consistent stock/total/ledger changes, and a retry identifier that prevents duplicate application. Test concurrent removal, add-versus-close, lost responses and failure recovery using isolated records.

**Live check:** All 267 current tab totals matched all 469 line items. No money discrepancy was found in this snapshot.

### 6. Profit is overstated and old tabs remain outstanding — high operational priority, confirmed live

**Problem and effect:** 36 of 55 active menu items have no cost. The sales calculation treats missing costs as zero. It therefore overstates profit on affected sales. Twenty tabs are open or away; the oldest dates to June 22. Their status needs business review rather than automatic deletion or closure.

**Evidence:** [database checks](database-checks.json); [src/app/admin/bar/sales/page.tsx:82](</Users/frankknight/Claude OS/Projects/one flame app/src/app/admin/bar/sales/page.tsx:82>). The whole-dollar migration has already shipped; do not follow older cents-migration instructions.

**Change:** Enter actual costs and show a clear “costs incomplete” warning with coverage, rather than presenting the resulting margin as fully known. Existing sale lines snapshot costs at sale time; entering menu costs now will not correct historic missing snapshots. Decide how to label or carefully backfill historic reporting. Review old open tabs with the owner and record legitimate settlement/write-off decisions through a supported workflow.

### 7. Artist approval can send an invitation and then get stuck — high, confirmed in source

**Problem and effect:** Approval first creates the auth user and sends an invitation, then creates an artist, links the profile and approves the application. A failure in later steps leaves a partial account and a pending application. Retrying starts by inviting the same email again and has no recovery path for the already-created account. Concurrent approval attempts are not atomically claimed.

**Evidence:** [src/app/admin/applications/actions.ts:49–110](</Users/frankknight/Claude OS/Projects/one flame app/src/app/admin/applications/actions.ts:49>).

**Change:** Make approval resumable and idempotent: atomically claim the pending application, record each durable step, reuse the known auth user on retry, and send the final usable invitation only after the profile link is ready. Do not remove an existing user as generic rollback. Surface delivery failures separately from approval state.

**Limit:** No real invitation was sent or application changed.

### 8. Artist uploads advertise sizes the host rejects — high workflow issue, source plus official hosting limit

**Problem and effect:** Artist asset uploads pass the file through a server action and accept 10 MB; profile photos accept 5 MB. The configured 10 MB application limit does not override Vercel’s 4.5 MB request-body limit. A valid file above that hosting limit can fail before the friendly validation runs; multipart overhead also consumes space.

**Evidence:** [src/app/portal/assets/actions.ts:36–44](</Users/frankknight/Claude OS/Projects/one flame app/src/app/portal/assets/actions.ts:36>), [src/app/portal/profile/actions.ts:27](</Users/frankknight/Claude OS/Projects/one flame app/src/app/portal/profile/actions.ts:27>), [next.config.ts:8](</Users/frankknight/Claude OS/Projects/one flame app/next.config.ts:8>). [Current Vercel limits](https://vercel.com/docs/functions/limitations) checked October 18. Admin video uploads already use a signed direct-to-storage path that avoids this problem.

**Change:** Extend the existing signed direct-upload approach to artist files and photos, with authorized paths, file size/type checks, completion validation, cleanup and progress/retry feedback. Until then, set an honest smaller limit with overhead allowance. Add storage bucket limits: all three live buckets currently have no configured size or MIME-type restrictions.

**Limit:** No large file was uploaded to production. This is an architectural limit conflict, not a claimed observed failed customer upload.

### 9. Rotated application codes are checked on the page, not on submission — medium, confirmed in source

**Problem and effect:** The form action accepts a hidden code identifier and inserts using the service role without rechecking that the code is active. Someone who opened the form before rotation can still submit it afterward. Contact and application forms have honeypots but no effective server-side rate limit or practical length bounds. Direct database insert policies also require review: application inserts currently have an unrestricted `WITH CHECK (true)` in migrations.

**Evidence:** [src/app/(public)/signup/[code]/page.tsx](</Users/frankknight/Claude OS/Projects/one flame app/src/app/(public)/signup/[code]/page.tsx>) checks `is_active`; the corresponding `actions.ts:48` does not. [src/app/(public)/contact/actions.ts](</Users/frankknight/Claude OS/Projects/one flame app/src/app/(public)/contact/actions.ts>) checks presence and email syntax only.

**Change:** Enforce active-code status during an atomic submission operation; force pending status and allowed fields at the database boundary. Add bounded inputs, rate limits, duplicate handling and delivery abuse protection. Confirm direct database writes cannot bypass those checks.

### 10. Newsletter subscription state and sending need recovery rules — medium, confirmed in source

**Problem and effect:** A previously unsubscribed address hits the unique-email error during resubscription. The action returns success without restoring active status, so the page says “You’re subscribed” while delivery remains disabled. Unsubscription accepts an arbitrary email without proof of control, allowing targeted removal of someone else. There is no confirmed-opt-in flow. Newsletter sends read the full audience without pagination, which can silently stop at the database API row limit as the audience grows. Partial batch failure followed by retry resends earlier batches.

**Evidence:** [src/app/(public)/subscribe/actions.ts:12–16](</Users/frankknight/Claude OS/Projects/one flame app/src/app/(public)/subscribe/actions.ts:12>), `unsubscribe/actions.ts:12–15`, [src/components/SubscribeForm.tsx:23](</Users/frankknight/Claude OS/Projects/one flame app/src/components/SubscribeForm.tsx:23>), [src/app/admin/subscribers/actions.ts:27–61](</Users/frankknight/Claude OS/Projects/one flame app/src/app/admin/subscribers/actions.ts:27>); local API configuration defaults to 1,000 rows. The live API maximum was not independently retrieved.

**Change:** Use signed recipient tokens for removal, an explicit consent/confirmation flow for subscription and reactivation, paginated or server-side audience selection, and a send ledger with per-recipient results and idempotent retries. Distinguish provider acceptance from actual delivery. Verify through controlled mailboxes; no real mail was sent in this audit.

### 11. Editing a regular customer immediately closes the form — medium, confirmed logic defect

**Problem and effect:** Clicking Edit sets `editing=true`. The effect sees the initial `state=null` and `pending=false`, and immediately sets it false again. Its condition does not mean a save just succeeded.

**Evidence:** [src/app/bar/regulars/RegularsClient.tsx:55–57](</Users/frankknight/Claude OS/Projects/one flame app/src/app/bar/regulars/RegularsClient.tsx:55>); this is also one of the current lint errors.

**Change:** Return an explicit successful-save result and close only after that submission completes. Check the actual signed-in edit/save/error interaction. No current regular was edited during this audit.

### 12. Asset deletion can remove a file before its database deletion fails — high recovery concern, confirmed in source

**Problem and effect:** The artist asset delete action removes storage first, ignores that result and then deletes the database row. Saved video jobs have a required foreign key to the source asset without a delete cascade. Deleting a referenced asset can therefore remove its file and then fail to delete its row, leaving a broken asset. Conversely, storage failure followed by row deletion leaves an orphaned private file.

**Evidence:** [src/app/portal/assets/actions.ts:144–152](</Users/frankknight/Claude OS/Projects/one flame app/src/app/portal/assets/actions.ts:144>); [supabase/migrations/20260513140946_initial_schema.sql:183](</Users/frankknight/Claude OS/Projects/one flame app/supabase/migrations/20260513140946_initial_schema.sql:183>).

**Change:** Check dependencies before deleting, use a recoverable deletion state, and coordinate storage cleanup after the database operation through a retryable job. Preserve source assets needed by saved records. Validate with isolated referenced/unreferenced assets, not existing media.

### 13. YouTube uploads can remain stuck or be duplicated — medium, confirmed in source

**Problem and effect:** The request action sets “uploading” before sending the background event, ignores the database update result and does not recover if event delivery fails. Repeated requests are not claimed uniquely. An uncertain response from YouTube followed by retry can create a second private upload.

**Evidence:** [src/app/admin/videos/actions.ts:104–120](</Users/frankknight/Claude OS/Projects/one flame app/src/app/admin/videos/actions.ts:104>), [src/lib/inngest/functions/upload-to-youtube.ts](</Users/frankknight/Claude OS/Projects/one flame app/src/lib/inngest/functions/upload-to-youtube.ts>). The worker does save a successful result in a separate durable step and uploads privately, which reduces accidental exposure.

**Change:** Atomically claim upload requests, persist a request identifier, handle event-send failure explicitly, and reconcile uncertain provider results before another upload. Provide an honest retry/recovery state. No YouTube upload was triggered.

## Product, hardening and maintenance changes

### 14. The site needs real catalog content and visit information — medium business priority, confirmed live

There are no releases and no published news posts. All nine active artist profiles lack a photo. The Lounge still says photos are on the way; it gives Montego Bay as the location but no precise address/map or opening hours. These are content and visitor-conversion gaps, not broken page rendering. Keep the existing brand and working initial tiles, but add approved artist photos, real release links, useful news, authentic Lounge images, accurate hours and directions. Confirm business facts with the owner rather than inventing them.

### 15. The branded invitation page accepts any destination — medium, confirmed live

`/auth/portal-invite?to=https%3A%2F%2Fexample.com` renders its “Set Password & Enter Portal” button linking to `https://example.com`. The external link was inspected but not followed. This makes a convincing label-branded phishing landing page possible. `src/app/auth/portal-invite/page.tsx:9,32` trusts the query parameter. Validate protocol, exact approved Supabase host and verification path, or replace the arbitrary destination with an opaque server-resolved invitation reference. Do not rely on React’s blocking of JavaScript URLs; ordinary malicious HTTPS destinations remain possible.

### 16. Public input can change the HTML of staff emails — medium, confirmed in source

The contact email inserts the sender name and fallback reason directly into HTML. Application notification rows insert stage/legal names, phone, genres and message without escaping. A sender can inject links or misleading formatting into an email presented as a label notification. This is HTML content injection; no claim is made that email clients execute scripts. Escape every untrusted text value before composing HTML and allow only intended formatting. Evidence: [src/app/(public)/contact/actions.ts:63–65](</Users/frankknight/Claude OS/Projects/one flame app/src/app/(public)/contact/actions.ts:63>), [src/lib/email/templates/applicationReceived.ts:38–50](</Users/frankknight/Claude OS/Projects/one flame app/src/lib/email/templates/applicationReceived.ts:38>). No malicious email was sent. Public news also renders raw Markdown-generated HTML; because editing is admin-only, sanitizer adoption there is additional defense, not a demonstrated public-author exploit.

### 17. Browser defenses and privacy wording need tightening — medium hardening priority

Live responses include HTTPS transport protection, but tested pages do not return a Content Security Policy, frame protection, or `X-Content-Type-Options`. Add a tested policy, initially in reporting mode where appropriate, that preserves the existing video/audio embeds and monitoring. Block unwanted framing and MIME guessing. This is a missing defense, not proof of a successful browser exploit. The privacy page should accurately explain error monitoring/session replay, performance analytics, authentication cookies and third-party embeds; the current wording discusses Supabase/Resend and broadly says information is collected only when volunteered. Verify actual collection and masking before revising claims. This is a product accuracy recommendation, not a legal-compliance certification.

### 18. Search appearance and accessibility have specific cleanup work — low to medium

Browser titles repeat the brand on artist, news and search pages because child metadata includes the brand and the root template appends it again. Measured public pages have no canonical link. Use the root title template once and add deliberate canonical URLs, including a policy for filtered/search pages. Login lacks a main heading. The artist upload form uses visual labels without `htmlFor`/control IDs or wrapping, so its fields are not properly named for assistive technology. Add programmatic labels; also provide a skip-to-main link and an accessible name/caption strategy for native videos. Public contact fields and the newsletter field were correctly labelled, and public phone layouts measured without horizontal overflow. No screen-reader certification, full keyboard audit, caption-content review or complete contrast audit is claimed.

### 19. Developer checks and error diagnosis need to become dependable — medium maintenance priority

Lint currently fails with four errors: the regulars editor, authenticator loading, and two session-timer effects. Fix the actual state/lifecycle problems rather than suppressing the checks. The full package audit’s five high entries trace to one development-only `braces` stack-exhaustion advisory; the production-only scan is clear. Preserve the installed framework and choose a compatible upstream fix when available; the automated suggestion to downgrade the lint configuration to Next 14 is unsuitable. See the [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

The hosted build warns that no Sentry auth token was provided for release creation/source-map upload. Errors may be captured, but production stack traces are harder to map to source. Configure the existing monitoring securely and verify a controlled error reaches the right release. The bounded error-log query returned no entries; that does not certify delivery or a completely error-free site. Align local verification with hosted Node 24, and add continuous checks for build/type/lint plus meaningful isolated authorization, bar-concurrency, approval and subscriber regressions. The repository currently has a Studio-retirement script but no tracked continuous-integration workflow or broad business-flow suite.

### 20. Recovery evidence and project instructions are stale — medium operational priority

The known local database backup is from August 15. Automated hosted backups, media backup coverage, retention, and a tested restore were not verified. Establish the actual backup plan and restore to an isolated environment, including storage files and account configuration. A database dump alone does not prove media recovery.

`CLAUDE.md` still describes cents columns as authoritative and gamer access as present despite the shipped whole-dollar migration and retired gamer screens. The next-session document also says October 5/8 work is awaiting deployment despite the newer live source. The operations runbook includes removed job-generation screens. Reconcile these documents against current code and decisions so future work does not restore retired features or undo the money model.

## Performance: current evidence, not a reason for a rewrite

Vercel’s preceding seven days of visitor measurements report:

| Measure at the 75th percentile | Desktop | Phone | Evidence limit |
| --- | ---: | ---: | --- |
| Main content visible (LCP) | 0.564 s | 1.647 s | 10 desktop and 6 phone samples |
| Response to interaction (INP) | 40 ms | 24 ms | 2 desktop and 4 phone samples |
| Unexpected movement (CLS) | 0 | 0 | 11 desktop and 5 phone samples |

The returned environment grouping shows production measurements. These figures fall inside Google’s [good-performance targets](https://web.dev/articles/vitals), but the small seven-day sample is insufficient to declare every route/device healthy or a formal 28-day pass.

Safe one-off HTTP checks took roughly 0.40–0.75 seconds including connection/transfer from this machine. Public HTML bodies were approximately 22–75 KB before any compression assessment. Homepage, roster, about, Lounge and other static content hit the hosting cache; filtered catalog/news/video pages are dynamic but use cached database reads in source. Do not interpret their private/no-store HTML response as proof that all database caching is broken. Seven-day server first-byte measurements are saved separately; server processing is not the same as visitor rendering.

**Proportionate suggestions:** Preserve the current design/framework and cache strategy. Add immediate public-content invalidation after admin saves where freshness matters; avoid caching transient database failures as empty catalogs; paginate growing datasets instead of pulling complete tables; give direct videos a useful poster and accessible media description. Measure on slower phones/networks as traffic grows. No Lighthouse lab run, low-bandwidth simulation, large-catalog load test or complete media transfer profile was performed.

## Remaining workflow checks and uncertainties

| Area | What was established | What remains unproven |
| --- | --- | --- |
| Public discovery | Public routes and all sitemap entries respond; roster/search render; phone menu and contact layout work | Real streaming/playback on all devices; captions; complete keyboard/screen-reader operation |
| Authentication | Signed-out protection; guard/source review; public registration setting | Signed-in role matrix, enrolled-admin second step, expired/revoked sessions; current live registration trigger |
| Artist onboarding | Submission and approval paths traced | Controlled application → approval → email delivery → password setup → portal access |
| Media | Private buckets remain private; owner filters in artist actions; upload paths inspected | Controlled upload/download/visibility/delete recovery; file-content validation; all storage policies |
| Bar money | Every current total matches line items; whole-dollar source present; access and transaction defects identified | Controlled tab lifecycle, stock/void reconciliation and concurrent/retry cases in signed-in UI |
| Gaming | Seven saved sessions, all without a linked tab item; start form does not create a sale | Whether charging is deliberately manual, and whether each session was collected elsewhere. Do not claim lost revenue without reconciliation |
| Email/YouTube | Source guards and failure paths inspected | Recipient delivery, bounce handling, provider credentials/quota and safe retry behavior |
| Reliability | Production Ready; seven-day returned request status summary contains no 5xx; build/typecheck pass | Full retention/error coverage, alert receipt, backup/restore and media recovery |
| Database security | Anonymous reads of profiles/applications/tabs/regulars/subscribers returned no rows; public legal-name leak and callable functions confirmed | Full current schema/policies/function grants and provider security-advisor results; saved management token was rejected |

A public 200 response, a successful build, and currently balanced tabs do not establish the untested workflows above.

## Suggested implementation order

1. **Contain access risks:** restrict internal database functions, verify/fix account-creation roles, remove public legal-name access, and enforce the administrator’s second sign-in step. Add focused denial tests before release.
2. **Protect business records:** transaction-safe bar operations and recoverable asset deletion, resumable artist approval, honest upload limits/direct uploads, and upload-worker recovery. Verify with isolated records and controlled inboxes.
3. **Make reports and messages truthful:** fill item costs, label historic cost gaps, review stale tabs, repair newsletter state/retry handling, and close the regulars editor defect. Reconcile gaming charges before making money claims.
4. **Improve conversion and maintenance:** approved catalog content/photos/directions/hours, public-form controls, invitation/email hardening, accessibility/search metadata, clean checks and usable monitoring, followed by a demonstrated backup restore.

The recommended first release is security containment, not a redesign or broad dependency upgrade. Each repair should retain the existing provider, brand and whole-JMD money decision, receive the project’s required independent review, and be verified separately as local work, released work and live behavior.
