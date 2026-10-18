# Operations runbook

October 18 recovery repairs and five migrations are live. See [release receipt](audits/2026-10-18-release/report.md) for proof and remaining limits.

## Sign-in and staff access

Use `/login`. Administrators with an enrolled, verified authenticator must complete `/auth/mfa` before administration or till access. Confirm the owner can use the authenticator before release. New public accounts receive artist access only. Invite bartenders through Admin → Bar → Staff; grant an existing artist the bartender flag there. Never accept a role from browser-supplied signup metadata.

## Artists and applications

Create public artist profiles through `/admin/artists`. Use approved photos and real biography/streaming information. Saved public edits invalidate the affected catalog pages.

QR submissions recheck the active code at submission time. Rotating `/admin/codes` stops new submissions from previously opened forms. Existing submitted applications remain.

Approval claims an application for five minutes and records provisioning progress. Repeating approval recovers the same eligible account instead of creating another. The artist/profile link completes before an invitation is generated. A delivery error is separate from approval success: review the displayed result and use the existing invitation action after verifying the account link; do not delete an account to retry approval. An email already linked to another artist or staff account requires owner review.

## Files and saved videos

Artist assets/photos and admin videos upload directly to authorized storage paths. The app validates completion before saving a reference. Preserve the existing file if replacing a profile photo fails. Private artist assets are limited to 10 MB; videos to 100 MB, subject also to the actual hosted plan limit. Never increase a limit without checking that plan.

Referenced source assets cannot be deleted. Successful asset-record deletion queues private-file cleanup. The hourly Inngest `storage-cleanup` function retries failures and checks there is no live reference before removing a file. Register it during release. Failed or abandoned upload reservations may leave files requiring a separate reviewed reconciliation; do not bulk-delete storage from row counts alone.

Catalog releases/videos use their normal admin forms. Retired AI Studio generation screens and workers stay removed. Saved songs/videos and all existing media remain.

YouTube uploads use a saved request identity. A queued request can retry event dispatch using the same identity. If upload may already have started, the app stops automatic resending and shows a review state. Inspect the saved request/provider receipt and the connected channel’s private videos. Reconcile a known video ID before allowing another upload. Never reset an uncertain request to queued without checking the provider; that could duplicate a video.

## Bar and reporting

Money remains whole Jamaican dollars. Tab edits, close/void operations, stock purchases, opening tabs and saving regular customers use transactional service operations. Keep the same client request identity when a response is lost. Reusing it with different inputs is rejected. Stock restoration uses the saved stock-source snapshot.

Gaming timers do not create charges. Add game time to the customer’s tab and reconcile collection separately. Reports show missing cost coverage and withhold a complete-profit claim where costs are unknown. Enter actual menu costs through administration; this does not fix missing historical sale costs. Old tabs, historical cost corrections and write-offs need Frank’s decisions. Never close or alter those records merely to clear an audit warning.

## Subscribers and newsletters

Subscribe requests send a confirmation link; only confirmation activates/reactivates consent. Unsubscribe links are signed for a recipient. Do not replace them with arbitrary email-only removal.

Admin → Subscribers lists saved sends and recipient progress. Continue the same send after refresh or an interrupted response. Provider acceptance is not proof of inbox delivery. Each recipient has a stable send identity. Claims expire for recovery, but an ambiguous send outside the provider’s retry window is marked for review rather than blindly resent. Resolve uncertain sends against provider records. Use controlled mailboxes for delivery/bounce checks; never use real subscribers for smoke tests.

## Release and recovery

Commit, push, migrations, hosted configuration and deployment require Frank’s approval. Follow the specific release sequence in the repair report. A previous application-only deployment is not a safe rollback after changing grants and workflow tables; prefer a reviewed forward repair. Do not restore insecure public grants to make old code work.

## Private backup and demonstrated restore

October 18 dashboard evidence confirms daily physical backups for October 11–18. A fresh private database/media backup and isolated restore passed. Ongoing media backup frequency and complete external-service recovery remain to establish. The management CLI token remains invalid, but dashboard sign-in and direct database connectivity now work with the official certificate. Never disable certificate checks as a workaround.

Before release:

1. Confirm the actual Supabase plan, backup schedule/retention, point-in-time recovery eligibility and restoration method in the current project dashboard. Record what is covered. Check current official documentation rather than assuming a paid-plan feature is enabled.
2. Take a fresh private schema/data/role backup using the current supported Supabase tooling. Include auth-account and storage metadata recovery requirements. Put files outside this repository with restricted permissions (`umask 077`), checksum them and record time, tool version, source project and counts. Keep secrets out of logs.
3. Export the actual storage objects privately, preserving bucket/path and checksums. Database dumps alone do not restore media. Record private/public bucket settings and required provider/environment configuration separately in an approved secret store.
4. Restore into an isolated project using the provider-supported sequence. Disable outbound email, webhooks, workers and other external effects before restoring. Do not point a restored environment at production services.
5. Compare table counts, representative whole-JMD totals, foreign keys, access grants, account links and media checksums. Confirm a test account’s role isolation and file access; verify restored private files remain private.
6. Record the result, failures, elapsed recovery time and backup location without credentials. A completed dump is not a successful restore test. Retain the existing backup until the new recovery proof is accepted.

October 18: fresh private database and media export completed; isolated database/file restore checks passed. Daily hosted backups were confirmed; point-in-time recovery is not enabled. See the release receipt.

## Monitoring and routine checks

Use Node 24. Run `npm run build`, `npm run typecheck`, `npm run lint` and `npm test`. Tests are isolated and do not establish provider delivery. The CI workflow runs type checking, lint and tests; the hosting build remains a separate gate.

Sentry source-map upload needs the existing server-only `SENTRY_AUTH_TOKEN` configured securely in the correct build environment. Verify a controlled error reaches the intended release and is readable, then remove the test trigger. Do not expose the token in browser variables. Replay masking is explicit in source; verify actual hosted collection and alert receipt. The broader Content Security Policy starts in report-only mode; inspect violations before enforcing resource restrictions.

Rotate credentials only with authorization and update the environments that actually use each credential. Do not revive retired provider integrations. Update project memory and the current brief without rewriting historical receipts; the delegation ledger owns unfinished work.
