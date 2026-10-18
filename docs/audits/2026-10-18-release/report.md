# October 18 repair release

The reviewed software repairs are live at [One Flame Records](https://www.oneflamerecords.com). Frank explicitly approved all changes and deployment. The five October 18 migrations committed together and the prepared production build was promoted successfully. Existing business records and media were preserved.

Release build: `dpl_BEDNwQzmdKUwaSSgKN5CEtTpKApC`, source `b7f4570`, Next.js 16.3.8, Node 24. Production build URL: [reviewed release](https://one-flame-records-ontwjsqvf-fknighteds-projects.vercel.app). A later Git synchronization may create an equivalent build; inspect the current alias for its serving ID.

## What was verified

- Fresh private database/roles export and all 23 storage objects (696,528,377 bytes) saved outside Git in `/Users/frankknight/one-flame-backups/2026-10-18-pre-audit-repairs/`.
- Full database restore into a network-isolated Supabase PostgreSQL 17.6 container: all 62 restored table counts and ordered row fingerprints matched the live source. All copied-back media files matched their recorded sizes and SHA-256 checksums. External provider services were disabled by network isolation; this was database/file recovery proof, not a complete hosted service rebuild.
- All five migrations applied successfully to the restored production schema before release. Original public/auth rows matched afterward, ignoring only the explicitly added columns. Live migrations then preserved those original rows too.
- Current live grants deny anonymous and signed-in browser execution of internal operations, deny direct bar/asset writes, and hide legal names while allowing public stage names. The account trigger now always assigns artist. Enrolled-admin second-step checks are in both app and database helpers. All five migration versions are recorded.
- Live public pages return successfully with browser protection headers. Admin, bar and portal require sign-in. External invitation destinations are rejected. Anonymous legal-name reads and old/new bar-operation probes are denied. Existing tab totals match line items.
- A synthetic account with self-selected admin metadata received only artist access. After controlled service assignment and authenticator enrollment, actual browser sign-in required the second step for both admin and bar. Completing it opened administration. Bartender could use the till but could not open admin; ordinary artist could open portal but not admin/bar; the artist bartender flag permitted the till route.
- Controlled browser tab: open → custom J$17 line → quantity two/J$34 → away lock → reopen → close as comp. Database state and six operation receipts matched. No real customer tab or stock item was used.
- Controlled regular: Edit stayed open; save persisted the note and closed the form only after success.
- Controlled pending artist: profile biography/photo saved and survived reload; the file downloaded correctly. Private synthetic one-second WAV uploaded through the browser, completed as a private asset and displayed its duration.
- Controlled asset deletion function removed the record and queued file cleanup. The native browser delete confirmation was cancelled after an automation focus problem, so UI confirmation-to-deletion is not claimed. The registered cleanup worker was invoked with only that synthetic file queued. Run `01M587MRFYQG2APS6B8R8DK928` completed and the queue emptied; the file returned 404 afterward.
- Inngest resynced against the production domain at 14:18 Jamaica time. Registered functions: hello-world, storage-cleanup, upload-to-youtube and its failure handler. Retired generation functions remain absent.
- All synthetic accounts, factors, profiles, artist, tab, regular, reservations and media were removed. Every original public business table (26 relations) matched its pre-release count and fingerprint afterward. Provider security audit logs were retained.
- Independent read-only live reviewer confirmed the serving Ready deployment, pages/headers, anonymous denial, recorded migrations and checked grants. No release blocker found. Its limits are recorded below.

Local regression tests and type checks pass. Lint passes with 25 warnings and no errors. Production dependency scan reports no known problems. The development-only braces problem remains; no incompatible downgrade was applied.

Evidence: [recovery](recovery-checks.json), [live database checks](live-database-checks.csv), [HTTP checks](live-http-checks.json), [test tab](live-test-tab.json), [asset deletion](asset-delete-check.json), [worker cleanup](worker-cleanup-check.json), [fixture cleanup](fixture-cleanup-check.json), [independent review](independent-live-review.md). Command logs and screenshots are alongside this report. Private dumps, media, passwords and authenticator secrets are not committed.

## Hosted protection and remaining limits

The dashboard shows scheduled daily physical backups for October 11–18, latest October 18 at 04:28:57 UTC. Point-in-time recovery is not enabled. Hosted database backups exclude actual storage files; the fresh private media export fills that gap for this release. This release does not establish an ongoing media-backup schedule or a complete external-service disaster-recovery exercise.

The existing GitHub sign-in restored dashboard access. The approved certificate from Database Settings fixed direct database verification; no certificate check was disabled. The old management CLI token is still invalid, but the approved release completed through a fully verified direct connection. Global Storage limit is 1000 MB, above the application’s 100 MB video and 10 MB private-asset caps. Spend cap remains enabled; no plan or billing changes were made.

Sentry’s hosted build still lacks release/source-map credentials (organization/project/auth token). Source supports secure configuration, but actual source-map upload and alert delivery remain unverified. No token was invented, printed or copied into browser configuration. Current production environment names also do not show YouTube OAuth credentials; actual YouTube delivery remains unproven and may require connecting the intended channel.

No real application invitation, newsletter/customer message or YouTube publication was sent. Provider delivery, bounce handling, approval-to-inbox/password setup and uncertain-provider-result reconciliation still need controlled provider checks. Local/isolated recovery tests cover their logic; they are not inbox/video-delivery proof. Full screen-reader/caption review and broad multi-device/load testing are not claimed.

The bounded post-release error scan returned only an unsigned Inngest probe’s expected signature rejection, induced by verification; no unrelated application error appeared in that window. That does not prove absence of errors outside the queried window or delivery of monitoring alerts.

Frank still needs to supply real missing item costs, decide historical-cost/old-tab/gaming reconciliation, and provide approved artist/Lounge photos, actual catalog/news, exact address/map and hours. No costs, business facts or settlements were invented.

## Account issue that needs attention

The Supabase dashboard warns that the organization exceeded its previous billing-cycle quota and projects may be restricted from **November 8, 2026** if it remains over quota. This affects the organization, not just this app. Review its [usage](https://supabase.com/dashboard/org/dkjegvwytpgxyffzwisg/usage) and billing with Frank; no spend-cap removal, upgrade, payment or unrelated-project change was performed.

## Recovery after this release

The private pre-release backup and recorded hashes are retained. Prefer a reviewed forward repair. Rolling back only the website to older code may conflict with tightened grants/new workflow tables; do not restore unsafe public access to accommodate old code. Any rollback must preserve subsequent legitimate business writes and current private files. Never restore the pre-release database over new business activity without an explicit recovery decision.

The [delegation](</Users/frankknight/Claude OS/Delegations/fix-all-recommendations-from-the-october-18-one-flame-full-s.md>) remains the authority for remaining work. Deployment is complete; this is not a claim that every business-content, provider or monitoring recommendation is complete.
