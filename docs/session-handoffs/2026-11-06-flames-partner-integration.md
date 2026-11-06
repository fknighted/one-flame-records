# Flames Partner integration — November 6, 2026

## Approved release supersedes local-only status

Frank subsequently approved the hosted migrations, publication, emails/daily job and conditional deletion of the old Supabase project. Both migrations were applied with exact SQL recorded in migration history. An independent reviewer confirmed unchanged original profile identities/roles, row permissions, hidden guarantor contacts/tokens and service-only operations. GitHub main contains functional release `2dd6867c`; production `dpl_CpiZ4EU9NK4hMkw22izLQF2owQvn` serves the public Partner page and existing administrator area. The protected daily job returned success. Application, guarantor request and approved-account emails were accepted once each using Resend simulation recipients and one explicit test membership; these checks do not prove a real customer inbox. The saved approved link uses One Flame Auth and the canonical callback.

`ops/legacy-partner-redirect/` contains independently reviewed static routing for the old addresses, with no functions or scheduled jobs. It blocks APIs/non-reading methods and clears old authentication fragments. The sole ledger linked below owns final live routing, deletion acceptance, cleanup and current serving identities. The following sections retain the original local evidence and its limits.

## Local preparation record

Frank authorized building the full existing savings app inside One Flame Records. He chose existing One Flame administrators only and conditionally authorized retiring the standalone app/database after verified cutover. No hosted data, settings, email or deployment was changed during implementation. The sole remaining-work record is `/Users/frankknight/Claude OS/Delegations/fold-the-existing-flames-partner-app-into-one-flame-records.md`.

## Candidate and baseline

Active worktree: `/Users/frankknight/Claude OS/Projects/one flame app/work/flames-partner-integration`, branch `codex/flames-partner-integration`, based on `8cb222fa`. The compared source matched the November 3 frozen serving baseline except for intended feature edits. The parent checkout's unrelated files were preserved. Existing lock/dependency versions were retained; the feature has its own exact-lock install. No source keys, owner records or email addresses were copied.

The public section, application/guarantor flow, member dashboard, administration, payments, queues/draws and audit history use One Flame accounts and Sound System styling. Namespaced tables protect existing artist/bar data. Spark accepts public applications; other tiers remain coming soon with interest forms and explicit test memberships. Payment amounts, eligibility and available draw money are calculated transactionally. Test and real funds never mix.

The two old administrators already have target accounts: one administrator and one artist. The artist keeps that role and receives no savings administration. New approved savings-only accounts receive a neutral Partner role. Private email jobs support retry, expiry and stale-worker fencing; existing account roles and approved consent are preserved. Shared One Flame mail styling/providers are reused.

## Evidence actually obtained

- Read-only source REST/Auth/Storage inventory: zero members, guarantors, payments, draws, agreements, audit and interest records; two administrator profiles/Auth accounts, no member links; zero storage buckets. No customer financial/file transfer needed at this check. Repeat at cutover.
- Full existing tests plus four new Partner suites passed. Tests cover row permissions, role spoofing, authenticator enforcement, atomic signup/retries, consent replay/expiry, payment/draw receipts, funds/test/tier separation, FIFO, audit immutability, archived-member totals, exact Jamaica calendar dates, delivery leases and provisioning recovery.
- Type check, production webpack build and affected lint passed. Full lint has 25 existing warnings and no errors. Production dependency audit has zero findings; install reported eight moderate development-only warnings. No dependency upgrade was made.
- Independent database reviewer accepted financial/date corrections, outbox and lease fencing. Independent app reviewer accepted link lifetime/provisioning/date/UI fixes. Separate review is recorded in the root ledger; this was not self-certification.
- Actual local browser flow: signup, guarantor consent, administrator payment, draw scheduling/payment/completion, creation of a clearly marked test member, member dashboard/sign-in and refusal of member access to admin/artist/bar routes. Browser used fictional data only; fixture payments after week one were seeded through the local service operation. The local member fixture was confirmed/assigned the neutral role for session-routing proof; actual interrupted provisioning behavior is covered by worker tests.
- Responsive public views inspected at phone/tablet/desktop widths including 320 px page-width check; no page-level horizontal overflow. Administration/member tables scroll within their containers. Existing mobile navigation opens/closes. An extension-injected development hydration warning was identified; production pages rendered and the complete local flow succeeded.
- Read-only hosted Auth check: confirmation enabled, sign-in links expire after 3600 seconds, canonical site/callback use `https://www.oneflamerecords.com`. Worker unsent-link refresh boundary is 45 minutes. Actual inbox/provider delivery is not established by local tests.

## Local runtime and limits

Local production preview: `http://127.0.0.1:3180/flames-partner`, disabled mail. Its disposable Supabase workspace is `/var/folders/s2/g_71tbnj3d97ymjsvml4q8j00000gn/T/oneflame-partner-local-xnvey0i8`, project `oneflame-partner-local`; API 54821 and all owned published ports are loopback-only. Docker network `oneflame-partner-test-loopback` is owned by this verification. No owner database was restored. Do not stop or delete unrelated Docker resources. Local ignored `.env.local` contains only fictional local connection settings; never stage it.

Vercel Git deployments are enabled for this public repository, so the source checkpoint remains local pending release authority. No bypass settings or skip markers were introduced. Production currently lacks `CRON_SECRET`; the new daily endpoint fails closed without it. Existing Resend/sender settings are present; enabling Partner delivery and creating the private job secret require the concrete release choice. Hosted migration, concurrency/provider delivery, scheduled invocation and old-domain handling remain outside local acceptance. See operations for the approved-release procedure; the ledger owns open commitments.
