# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What we're building

A web platform for One Flame Records, a Jamaican record label based in Montego Bay. Three audiences:

1. **The public** — discover the label, artists, releases, and videos via the public site (oneflamerecords.com).
2. **Signed artists** — log in to a portal to manage their profile, upload demos and instrumentals, and request automated music videos.
3. **The label (admin)** — manage artists, releases, videos, and approve new signups via QR application.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components by default)
- **Tailwind CSS v4** — CSS-first config, brand tokens defined in `src/app/globals.css` `@theme inline` block (no `tailwind.config.ts`)
- **Supabase** — Postgres, Auth, Storage, Row-Level Security
- **Resend** — transactional email (Phase 3)
- **Inngest** — durable workflow orchestration for the video automation pipeline (Phase 4)
- **Vercel** — hosting; push to `main` triggers deploy

> **Note:** AGENTS.md says this Next.js version has breaking changes from prior releases. Read `node_modules/next/dist/docs/` before writing new routing or middleware code.

Side stack used elsewhere in the business (do not pull into this repo): Make.com for ops glue, Airtable for the chef-service scenario.

## Repo layout

All documentation lives at the **repo root** (not in a `docs/` subfolder):

```
architecture.md        ← data model, RLS, routes, env vars
brand.md               ← palette, typography, voice, components
video-pipeline.md      ← Inngest design, model interface (Phase 4)
operations.md          ← runbook for common admin tasks
phase-1-admin-foundation.md
phase-2-public-site.md
phase-3-qr-onboarding.md
phase-4-video-automation.md
PROGRESS.md            ← living status, update at end of every session
DECISIONS.md           ← append-only architectural decision log
```

Source:

```
src/
├── app/
│   ├── admin/         ← ink-theme label admin dashboard (built — Phase 1)
│   ├── portal/        ← ink-theme artist portal (stub — Phase 3)
│   ├── login/         ← shared login page
│   └── api/           ← route handlers (Inngest webhook goes here in Phase 4)
├── components/        ← ArtistForm, ReleaseForm, VideoForm, LogoutButton
├── lib/supabase/      ← client.ts, server.ts, middleware.ts (session helper)
├── proxy.ts           ← Next.js middleware — route protection + role check
└── types/supabase.ts  ← generated DB types
supabase/
├── migrations/        ← numbered SQL migrations
└── seed.sql
```

Route groups `(public)` and `(portal)` from the architecture plan are **not yet created** — public pages are planned for Phase 2, the portal for Phase 3.

## Common commands

```bash
# Development
npm run dev                    # Next.js dev server with Turbopack
npx supabase start             # local Supabase (requires Docker)
npx inngest-cli dev            # local Inngest dev server (Phase 4 only)

# Database
npx supabase migration new <name>     # create a new migration
npx supabase db push --linked         # apply migrations to remote
npx supabase gen types typescript --linked > src/types/supabase.ts

# Build & check
npm run build
npm run lint
npm run typecheck              # tsc --noEmit
```

There are no automated tests yet. Type checking (`npm run typecheck`) is the primary correctness gate before shipping.

## Architecture: non-obvious decisions

### Middleware is `src/proxy.ts`

The Next.js route-protection middleware lives at `src/proxy.ts` (exports `proxy` and `config`). The Supabase session helper is a separate file at `src/lib/supabase/middleware.ts`. **Never import from `src/lib/supabase/server.ts` inside the proxy** — it pulls in `next/headers`, which is incompatible with Edge Runtime.

### Auth is client-side only

Login uses `createBrowserClient` (from `@supabase/ssr`) and navigates via `window.location.href = "/admin"` after success. Do not use a Server Action for sign-in: in Next.js 16, cookies set inside a Server Action are not reliably forwarded when `redirect()` is called, causing a session loop. The proxy (`src/proxy.ts`) then reads the session from cookies and checks the role using a service-role client.

### Two Supabase clients

- **`createClient()`** (`src/lib/supabase/server.ts`) — uses `@supabase/ssr`, respects the user's session cookies, subject to RLS. Use in Server Components and Route Handlers.
- **`createServiceClient()`** (`src/lib/supabase/server.ts`) — raw `supabase-js` with the service role key, bypasses RLS entirely. Use only in Server Actions and admin-side logic. Never import into a Client Component or the proxy file.

### Server Action pattern

Mutations use Server Actions in `actions.ts` files co-located with the route. The standard return type is:

```ts
export type ActionState = { error: string } | null;
```

Forms use `useActionState` for inline error display. Server Actions have a 10 MB body size limit (set in `next.config.ts`) to support photo/cover uploads.

### Tailwind v4 — CSS-first

Brand tokens (`--color-oxblood`, `--color-cream`, etc.) are defined in `src/app/globals.css` inside an `@theme inline` block. There is no `tailwind.config.ts`. The `brand.md` doc shows a `tailwind.config.ts` excerpt that is illustrative only — ignore it.

## Conventions

**Server vs client.** Default to Server Components. Add `"use client"` only for state, effects, or browser APIs. Fetch data on the server.

**Database access.** Never call Supabase from a Client Component. Mutations go through Server Actions or Route Handlers.

**File naming.** Components are `PascalCase.tsx`. Utilities are `kebab-case.ts`. Use the `@/` alias for `src/`; no relative paths deeper than one `../`.

**Database changes.** Every schema change is a numbered SQL migration. Never edit an applied migration — write a new one. Update `architecture.md` in the same commit.

**Commits.** Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. One logical change per commit.

**Themes.** Two visual worlds: `cream` (public site, `#ECE2C8` bg) and `ink` (portal + admin, `#1A1612` bg). Theme is a wrapper class on the route group layout, not a context or runtime toggle.

## Things to never do

- Never bypass Row-Level Security with the service role key in client-reachable code.
- Never store full media files in the database. Use Supabase Storage; keep URLs in tables.
- Never call Supabase from a Client Component.
- Never deploy a destructive migration to production without backing up first.
- Never use a real artist's email or PII in seed data or test fixtures.
- Never modify `CLAUDE.md`, `PROGRESS.md`, or `DECISIONS.md` silently — these are the project memory.

## Brand quick reference

Full system in `brand.md`. The essentials:

- **Oxblood** `#8B2A1F` — headlines, the flame
- **Forest** `#3F5A3A` — accents, inner flame
- **Cream** `#ECE2C8` — public site background
- **Ink** `#1A1612` — portal/admin background
- **Bone** `#F5EDD8` — body text on ink
- **Ochre** `#B8893B` — CTA buttons, badges, hover states (use sparingly)

Fonts loaded via `next/font`: **Fraunces** (display/headlines), **Inter** (body).

## Environment variables

Full list in `.env.example`. Phase 1 minimums:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose
- `NEXT_PUBLIC_SITE_URL`
- Phase 3: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- Phase 4: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `KLING_API_KEY`

## Current phase

Phase 1 (admin foundation) is in progress — Tasks 1–9 complete. Task 10 is Vercel deploy + domain. See `PROGRESS.md` for live status and blockers.

Do not start work on a later phase before the current one's acceptance criteria are met. Phase plans with concrete tasks live in the root-level `phase-*.md` files.

## End of session checklist

1. Update `PROGRESS.md` — what got done, blockers, next session goal.
2. If a non-obvious architectural decision was made, append an entry to `DECISIONS.md`.
3. Commit and push.
