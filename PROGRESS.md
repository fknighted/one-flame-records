# Progress

This is the living state of the build. Update at the end of every session.

---

## Current state

- **Phase:** 1 — Admin foundation
- **Status:** In progress — Tasks 1–3 complete, Task 4 next
- **Last updated:** 2026-05-13

## Active focus

Task 4 — Row-Level Security policies: enable RLS on all 8 tables, write policies per architecture.md.

## Blockers

None.

## Next session

1. Initialize Next.js 15 with App Router, TypeScript, Tailwind (`phase-1` Task 1)
2. Create the Supabase project and link via CLI (`phase-1` Task 2)
3. Write the initial migration for `artists`, `releases`, `videos` (`phase-1` Task 3)
4. Push to GitHub, connect Vercel, deploy a "hello world" to oneflamerecords.com

## Phase progress

- [ ] **Phase 1** — Admin foundation _(in progress / not started / done)_
- [ ] **Phase 2** — Public site
- [ ] **Phase 3** — QR onboarding + artist portal
- [ ] **Phase 4** — Video automation

---

## Session log

Append a new entry at the top of this section after every session. Date, summary, files touched, what's next. Keep it tight — full reasoning belongs in `DECISIONS.md`.

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
