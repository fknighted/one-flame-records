# Progress

This is the living state of the build. Update at the end of every session.

---

## Current state

- **Phase:** 1 — Admin foundation
- **Status:** In progress — Task 1 complete, Task 2 next
- **Last updated:** 2026-05-13

## Active focus

Task 2 — Connect Supabase (create project, install CLI, wire server/client/middleware helpers, add env vars).

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
