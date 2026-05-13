# Progress

This is the living state of the build. Update at the end of every session.

---

## Current state

- **Phase:** 3 — QR onboarding + artist portal
- **Status:** Phase 2 complete. Phase 3 not started.
- **Last updated:** 2026-05-13

## Active focus

Phase 3, Task 1 — QR signup landing page (`/signup/[code]`) and application form.

## Blockers

- `public-media` storage bucket not yet created. Run in Supabase SQL Editor:
  ```sql
  insert into storage.buckets (id, name, public) values ('public-media', 'public-media', true) on conflict (id) do nothing;
  ```
- Resend domain DNS verification still pending for `oneflamerecords.com`. Check Resend dashboard before testing contact form in production.

## Next session

1. Confirm `phase-2-complete` tag is pushed
2. Create `public-media` storage bucket (see blocker above)
3. Phase 3, Task 1 — QR signup landing page and application form

## Phase progress

- [x] **Phase 1** — Admin foundation _(complete — Task 11 / real data deferred to after Phase 2)_
- [x] **Phase 2** — Public site _(complete)_
- [ ] **Phase 3** — QR onboarding + artist portal
- [ ] **Phase 4** — Video automation

---

## Session log

Append a new entry at the top of this section after every session. Date, summary, files touched, what's next. Keep it tight — full reasoning belongs in `DECISIONS.md`.

### 2026-05-13 (session 8)

**Did:** Built all 9 Phase 2 tasks — public layout shell (Task 1), homepage with live Supabase data (Task 2), artists list + detail pages (Task 3), releases list + detail pages (Task 4), videos page with filters (Task 5), about page with editorial timeline (Task 6), contact form with Resend + honeypot spam protection (Task 7), SEO/metadata pass — `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, JSON-LD, `metadataBase` (Task 8), Lighthouse audit + accessibility fixes — ochre→forest eyebrow contrast, footer `<h3>` → `<p>`, image alt text (Task 9).
**Touched:** `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/artists/`, `src/app/(public)/releases/`, `src/app/(public)/videos/page.tsx`, `src/app/(public)/about/page.tsx`, `src/app/(public)/contact/`, `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/components/PublicHeader.tsx`, `src/components/PublicFooter.tsx`, `src/components/ArtistCard.tsx`, `src/components/ReleaseCard.tsx`, `src/components/VideoEmbed.tsx`, `src/components/ReleasesFilter.tsx`, `src/components/VideosFilter.tsx`, `src/components/ContactForm.tsx`, `src/components/SectionHeader.tsx`, `next.config.ts`, `PROGRESS.md`, `DECISIONS.md`
**Decided:** Ochre→forest for eyebrow text (contrast); server-component wrapper for pages needing metadata + client form; `createServiceClient` in sitemap.ts; click-to-play VideoEmbed; URL-based filtering for Releases/Videos. All logged in DECISIONS.md.
**Blocked on:** `public-media` bucket not yet created. Resend domain DNS pending verification.
**Next:** Phase 3 Task 1 — QR signup landing page (`/signup/[code]`) and application form.

### 2026-05-13 (session 7)

**Did:** Built Artists CRUD (Task 7), Releases CRUD (Task 8), and Videos CRUD (Task 9). Each section has a list page, new form, and edit form. Shared client components — ArtistForm, ReleaseForm, VideoForm — use `useActionState` for inline error display. Photo/cover uploads go to `public-media` bucket via service role. YouTube ID extraction in VideoForm accepts bare IDs or any youtube.com/youtu.be URL and previews the thumbnail live. Fixed a TypeScript error where `Record<string, unknown>` conflicted with Supabase's strict `.update()` type.
**Touched:** `next.config.ts`, `src/app/admin/artists/`, `src/app/admin/releases/`, `src/app/admin/videos/`, `src/components/ArtistForm.tsx`, `src/components/ReleaseForm.tsx`, `src/components/VideoForm.tsx`, `PROGRESS.md`
**Decided:** No new architectural decisions — followed the Server Action + useActionState pattern established in prior sessions.
**Blocked on:** `public-media` storage bucket not yet created (SQL editor one-liner in blockers above).
**Next:** Task 10 — Vercel deploy + domain.

### 2026-05-13 (session 6)

**Did:** Rebuilt admin layout shell (Task 6): ink-theme wrapper, sidebar nav, top bar with user email and logout button. Overview page with 4 live stat cards (artists, releases, videos, pending applications) using service client. Stub pages for all 7 nav sections. Typecheck clean.
**Touched:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/LogoutButton.tsx`, `src/app/admin/artists/page.tsx`, `src/app/admin/releases/page.tsx`, `src/app/admin/videos/page.tsx`, `src/app/admin/applications/page.tsx`, `src/app/admin/codes/page.tsx`, `src/app/admin/jobs/page.tsx`, `PROGRESS.md`
**Decided:** Nothing new.
**Blocked on:** Nothing.
**Next:** Task 7 — Artists CRUD.

### 2026-05-13 (session 5)

**Did:** Built login page (client-side auth via createBrowserClient), proxy route protecting /admin and /portal, stub admin and portal pages. Fixed several issues: middleware→proxy rename for Next.js 16, createServiceClient using raw supabase-js instead of @supabase/ssr (so service role actually bypasses RLS), login page always navigating to /admin (proxy handles role redirect with service role). Re-applied RLS policies via SQL editor (first run silently failed). Confirmed full flow: login → /admin → ink dashboard.
**Touched:** `src/app/login/page.tsx`, `src/proxy.ts`, `src/lib/supabase/server.ts`, `src/app/admin/page.tsx`, `src/app/portal/page.tsx`, `PROGRESS.md`
**Decided:** Client-side signInWithPassword (not Server Action) required for Next.js 16 — cookies from Server Action redirects don't survive the response reliably. Proxy uses inline service client (not imported from server.ts) to avoid next/headers in Edge Runtime. See DECISIONS.md.
**Blocked on:** Nothing.
**Next:** Task 6 — admin layout shell.

### 2026-05-13 (session 4)

**Did:** Wrote RLS migration — `is_admin()` + `current_artist_id()` helpers, enabled RLS on all 8 tables, wrote all policies per architecture.md. Applied via SQL editor, repaired migration history.
**Touched:** `supabase/migrations/20260513154209_add_rls_policies.sql`, `src/types/supabase.ts`, `PROGRESS.md`
**Decided:** Column-level restriction on artist self-edit of `artists` enforced at app layer (not RLS), since RLS can't restrict individual columns natively.
**Blocked on:** Nothing.
**Next:** Task 5 — login page, Server Action, middleware.

### 2026-05-13 (session 3)

**Did:** Wrote initial schema migration (all 8 tables, updated_at triggers, handle_new_user trigger). Applied to remote via SQL editor (direct DB port blocked — workaround). Repaired migration history with `migration repair`. Regenerated TypeScript types from correct project. Discovered old env was pointing at wrong Supabase project — corrected to `blfdkhefsjjnsfdmenxn`.
**Touched:** `supabase/migrations/20260513140946_initial_schema.sql`, `src/types/supabase.ts`, `.env.local`, `PROGRESS.md`
**Decided:** Applied migration manually via SQL editor due to port 5432 being blocked; used `supabase migration repair --status applied` to sync history. See DECISIONS.md if this becomes a pattern.
**Blocked on:** Nothing.
**Next:** Task 4 — RLS policies migration.

### 2026-05-13 (session 2)

**Did:** Connected Supabase. Installed @supabase/supabase-js + @supabase/ssr. Created server/client/middleware lib helpers. Initialized supabase CLI, linked to remote project (us-east-1). Wrote .env.example and .env.local. Confirmed live auth health check.
**Touched:** `src/lib/supabase/`, `src/types/supabase.ts`, `supabase/`, `.env.example`, `.gitignore`, `package.json`
**Decided:** Used SUPABASE_ACCESS_TOKEN env var instead of browser login flow (session expired). Token stored in .env.local only.
**Blocked on:** Docker needed for Task 3 local Supabase start. Can write migration SQL now; apply when Docker is up.
**Next:** Task 3 — write initial_schema migration, apply to remote (--linked), generate types.

### 2026-05-13

**Did:** Initialized Next.js app (scaffolded via create-next-app, hoisted to repo root). Added Tailwind v4 brand tokens in globals.css `@theme` block. Wired Fraunces + Inter via next/font. Placeholder home page (cream bg, oxblood headline). Created GitHub repo fknighted/one-flame-records and pushed.
**Touched:** `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `package.json`, `.gitignore`, `CLAUDE.md`, `DECISIONS.md`
**Decided:** Tailwind v4 (CSS-first config, no tailwind.config.ts); Next.js 16 (latest from npm, plan said 15 — no issues). See DECISIONS.md.
**Blocked on:** Nothing.
**Next:** Task 2 — Supabase project, CLI link, server/client/middleware helpers, env vars.

### Template

```
### YYYY-MM-DD

**Did:** what got built or changed
**Touched:** key files / migrations
**Decided:** any architectural calls (also log in DECISIONS.md if non-obvious)
**Blocked on:** if anything
**Next:** what to pick up tomorrow
```

### YYYY-MM-DD — Project kickoff _(replace with real date when you start)_

**Did:** Created the repo, dropped in CLAUDE.md, PROGRESS.md, DECISIONS.md, docs/, phases/.
**Touched:** All scaffolding documents.
**Decided:** Stack locked — Next.js 15 + Supabase + Vercel + Inngest. Two visual themes (cream public, ink portal). QR signup is single reusable code + admin approval gate.
**Blocked on:** Nothing.
**Next:** Phase 1, Task 1.
