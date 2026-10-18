# One Flame audit repairs — October 18, 2026

The recommended software repairs are implemented locally and independently reviewed. Production is unchanged. No commit, push, hosted migration, deployment, real email, media upload, YouTube upload, account provisioning or business-data correction was performed.

The application keeps its existing brand, providers, framework and whole-Jamaican-dollar money model. Research and implementation ran sequentially; a separate read-only agent reviewed the changes. No research fan-out ran.

## What changed and what it means

| Original finding | Local repair | Remaining proof or owner input |
| --- | --- | --- |
| 1. Anonymous bar functions | Internal functions and sensitive table writes restricted to service actions; paths pinned | Apply migration; verify hosted grants and signed-in roles |
| 2. Self-selected signup role | Registration always assigns artist; bartender role assigned by authorized staff action | Confirm actual hosted trigger and existing accounts; no claim an attack happened |
| 3. Public legal names | Explicit public column grants exclude legal names; portal selects allowed fields | Apply migration and recheck live anonymous reads |
| 4. Admin second step | Verified enrolled authenticators require a second step in guards, proxy and database helpers, including bar access | Verify owner factor access and real signed-in challenge; enrollment remains an owner action |
| 5. Partial or repeated sales | Locked transactional bar operations, stock snapshots and stable retry receipts; atomic stock purchases, opening tabs and regular creation | Full hosted till lifecycle and independent concurrent database sessions |
| 6. Incomplete profit and old tabs | Reports show missing costs and avoid claiming complete profit; old-tab notice; gaming form explains manual charging | Actual costs, historic corrections, tab settlement/write-off and gaming reconciliation need Frank’s decisions |
| 7. Stuck artist approval | Leased approval, saved provisioning IDs, existing-account recovery, profile completion before invite | Controlled application → approval → mailbox → password → portal journey |
| 8. Upload limits | Direct signed storage uploads for artist files/photos; authorized reservations, size/type/path checks and repeat-safe completion; bucket caps | Hosted plan/global cap, actual file checks, controlled upload/download and failure recovery |
| 9. Stale QR and public abuse | Active code checked inside submission; bounded inputs, supported contact reasons, honeypot and atomic hashed rate limits; unsafe public insert policies removed | Hosted form/rate-limit behavior; abuse limits are mitigation, not a guarantee |
| 10. Newsletter consent/retries | Single-use confirmation/reactivation, signed unsubscribe, server audience snapshot, saved run and recipient results, provider idempotency and uncertain-send review; unfinished sends recover after refresh | Controlled consent, unsubscribe, delivery/bounce and interrupted-send provider checks |
| 11. Regular edit closes early | Close editor only after successful awaited save | Signed-in edit/error/save interaction |
| 12. Broken asset deletion | References checked; record deletion and cleanup queue commit together; deleted reservation cannot recreate a record; hourly cleanup retries storage removal | Hosted worker registration and controlled referenced/unreferenced file checks |
| 13. Stuck/duplicate YouTube | Request claim, saved event ID/provider receipt, honest uncertain state and receipt reconciliation; source download restricted to own storage | Controlled provider upload and ambiguous-result reconciliation |
| 14. Missing content | Preserved truthful placeholders and working roster; no invented business content | Approved artist/Lounge photos, real releases/news, exact address/map and hours |
| 15. Misleading invite destination | Exact approved HTTPS Supabase verification origin/path allowlist | Valid controlled invitation journey |
| 16. Email HTML injection | Escape public text; safe Markdown renderer rejects raw HTML/dangerous URL schemes | Controlled template rendering/delivery |
| 17. Browser/privacy defenses | Frame/type/referrer/permissions headers; enforced narrow resource policy plus broader report-only policy; privacy text and explicit replay masking | Inspect hosted policy reports, embeds, collection and masking before broader enforcement |
| 18. Search/accessibility | Single brand titles, deliberate canonical links, no-index search/auth, login heading, labels, skip link and video name | Full keyboard/screen-reader check; transcripts/captions and approved video posters remain content work |
| 19. Checks/diagnosis | Fixed four lifecycle errors; Node 24; isolated migration/security/business regressions; CI checks; modern Sentry build options | Lint warnings remain. Development-only braces advisory has no selected compatible fix. Sentry secret/configuration, readable source maps and actual alert delivery need hosted verification |
| 20. Recovery/docs | Updated current instructions, README, brief, architecture and operations; private backup/isolated restore procedure | Current hosted backup plan, fresh export, media backup and successful restore remain unproved |

Public catalog edits invalidate affected cached pages. Growing releases/videos are read in bounded pages; failed database reads throw instead of becoming cached empty catalogs. Existing performance evidence did not justify a design/framework rewrite. No new speed score or broad load-test claim is made.

## Verification

Final local checks use Node 24.15.0, matching the hosted major version:

- Production build passes.
- Type checking passes, including route-type generation in a clean temporary check without environment files or existing build output. The CI workflow generates these types before checking.
- Tests pass: complete migration-history execution in an isolated PostgreSQL-compatible engine; access denial and role checks; bar receipt misuse/retry/rollback; approval recovery; upload/delete replay; newsletter confirmation/snapshot/claim/retry; hostile email/Markdown/token inputs; client retry identity; retired-feature checks.
- Lint exits successfully with 25 warnings and no errors. Warnings are not presented as a completely clean lint report.
- Production dependency scan reports no known problems. The earlier all-package scan’s five high entries trace to a development-only braces issue. No incompatible lint/framework downgrade was applied.
- Diff whitespace check passes.

[Independent review](independent-review.md) records the separate reviewer’s scope and checks. The reviewer found no remaining high/medium blocker in the reviewed paths after corrections. This is not a security certification.

[Browser evidence](browser-checks.json) covers local public phone layouts, titles/canonicals, invalid invitation/confirmation handling and native empty-contact validation. [Header evidence](local-headers.json) records local response defenses. Authenticated staff/artist browser journeys and external provider delivery remain untested. Isolated PostgreSQL-compatible tests are not hosted Supabase or multi-session concurrency proof.

Final command outputs are saved alongside this report. No secrets or real customer fixture data are included.

## Release sequence — approval required

1. Obtain Frank’s explicit release approval. Refresh Supabase management authorization and trusted database connectivity: saved management credentials returned 401, and strict database TLS validation failed. Do not bypass certificate verification. Inspect the actual hosted schema/grants/triggers and migration history for drift before applying these migrations.
2. Confirm current hosted storage limits, required environment variables, administrator authenticator access, and a current private backup covering database, accounts/configuration and actual media. Demonstrate recovery in an isolated environment using [the runbook](../../operations.md). Stop if a preflight fails.
3. Arrange a short maintenance window with the till closed and artist uploads/staff invitations paused. New code requires new functions; older code may be denied by tightened grants. Avoid running mismatched versions.
4. Apply, in order: `20261018000001_access_hardening.sql`, `20261018000002_atomic_bar_operations.sql`, `20261018000003_workflow_recovery.sql`, `20261018000004_newsletter_delivery.sql`, `20261018000005_youtube_recovery.sql`. Check applied migration history and resulting grants. Preserve existing data/media.
5. Release the reviewed matching source through the existing Vercel project. Configure existing Sentry source-map credentials securely if authorized; do not introduce new providers. Resync Inngest and confirm only current hello, YouTube and storage-cleanup functions, with retired generation workers absent.
6. Use isolated controlled records/accounts/inboxes for the signed-in role matrix, enrolled-admin second step, tab/stock lifecycle and concurrent retry, approval/invitation, upload/replacement/delete cleanup, newsletter consent/delivery/retry and YouTube private-upload recovery. Verify database state and external receipts as well as UI messages. Clean up only the identified test records with approval where required.
7. Recheck anonymous denial/public columns, public pages/embeds/cache freshness, browser headers, monitoring release/source maps/alerts and error logs. Record the serving release and exact results before calling work live and complete.

Prefer a reviewed forward repair if release fails. Application-only rollback after tightened grants is not guaranteed compatible; do not restore insecure grants as a shortcut. Keep a recovery window and tested backup. Do not reset uncertain provider sends/uploads or settle business tabs just to clear warnings.

## Still needed from Frank

Actual missing item costs; a decision on historical costs and old tabs; approved artist/Lounge photos; real catalog/news content; exact Lounge address/map and opening hours. No assumed figures, fabricated content or automated write-offs were used.

The canonical work state and release approval remain in [the delegation](</Users/frankknight/Claude OS/Delegations/fix-all-recommendations-from-the-october-18-one-flame-full-s.md>). This report is evidence, not a competing task list.
