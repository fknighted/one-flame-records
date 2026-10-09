# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What we're building

A web platform for One Flame Records, a Jamaican record label based in Montego Bay. Four audiences:

1. **The public** — discover the label, artists, releases, and videos via the public site (oneflamerecords.com).
2. **Signed artists** — log in to a portal to manage their profile, upload demos and instrumentals, and access saved videos.
3. **The label (admin)** — manage artists, releases, videos, news, and approve new signups via QR application.
4. **Bartenders** — log in to `/bar` to run the Flames Lounge POS (tabs, menu items, game sessions). Artists can also be bartenders via `profiles.is_bartender = true` flag.

> Gamer accounts, the gamer portal and member screens were removed on 2026-10-09 (`docs/decisions.md`). Gaming is walk-in only; the database tables stay.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components by default)
- **Tailwind CSS v4** — CSS-first config, brand tokens defined in `src/app/globals.css` `@theme inline` block (no `tailwind.config.ts`)
- **Supabase** — Postgres, Auth, Storage, Row-Level Security
- **Resend** — transactional email
- **Inngest** — durable YouTube uploads
- **Make.com** — social posting webhook (Instagram, Facebook, TikTok) — not direct API calls
- **Sentry** — error tracking (active in production)
- **Vercel** — hosting; push to `main` triggers deploy

> **Note:** This Next.js version has breaking changes from prior releases. Read `node_modules/next/dist/docs/` before writing new routing or middleware code.

Side stack used elsewhere in the business (do not pull into this repo): Make.com for ops glue, Airtable for the chef-service scenario.

## Repo layout

All documentation lives in **`docs/`** (see the vault-level `PROJECT-CONVENTIONS.md`):

```
docs/
├── project-memory.md      ← living status, update at end of every session
├── next-session-prompt.md ← short "pick this up next" brief
├── decisions.md           ← append-only architectural decision log
├── architecture.md        ← data model, RLS, routes, env vars
├── brand.md               ← short pointer to design-system/
├── video-pipeline.md      ← Inngest design, model interface
├── operations.md          ← runbook for common admin tasks
├── Creative Systems Overview.md  ← full reference doc (for ChatGPT/Claude Web upload)
└── phases/                ← phase-1…phase-5 build plans
```

Source:

```
src/
├── app/
│   ├── (public)/      ← Sound System public site (home, artists, releases, videos, news, about, contact, signup, flames-lounge)
│   ├── admin/         ← studio-look label admin (artists, releases, videos, news, applications, bar/*)
│   ├── portal/        ← studio-look artist portal (profile, assets, releases, videos)
│   ├── bar/           ← studio-look bartender POS (tabs, inventory, sessions)
│   ├── login/         ← shared login page
│   ├── auth/          ← callback, portal-invite, set-password pages
│   └── api/inngest/   ← Inngest webhook route handler
├── components/        ← shared UI components (PascalCase)
├── lib/
│   ├── supabase/      ← client.ts, server.ts, middleware.ts
│   ├── inngest/       ← client.ts + functions/ (hello, upload-to-youtube)
│   ├── social/        ← meta.ts, tiktok.ts (fire Make.com webhook, do not call platform APIs directly)
│   ├── email/         ← send.ts + templates/
│   ├── bar/           ← pos.ts (shared bar utilities: formatCents, jamaicaMidnight, CATEGORY_LABELS, etc.)
│   ├── auth.ts        ← server-side role helpers (requireAdmin, requireBarStaff)
│   └── spotify.ts
├── proxy.ts           ← Next.js middleware — route protection + role check
└── types/supabase.ts  ← generated DB types
supabase/
├── migrations/        ← numbered SQL migrations
└── seed.sql
```

## Common commands

```bash
# Development
npm run dev                    # Next.js dev server with Turbopack
npx supabase start             # local Supabase (requires Docker)
npx inngest-cli dev            # local Inngest dev server

# Database
npx supabase migration new <name>     # create a new migration
npx supabase db push --linked         # apply migrations to remote
npx supabase gen types typescript --linked > src/types/supabase.ts

# Build & check
npm run build
npm run lint
npm run typecheck              # tsc --noEmit
```

Type checking (`npm run typecheck`) is the primary correctness gate. Run `node scripts/test-studio-retirement.mjs` for offline video-retirement regression checks; all services are mocked.

## Architecture: non-obvious decisions

### Middleware is `src/proxy.ts`

The Next.js route-protection middleware lives at `src/proxy.ts` (exports `proxy` and `config`). The Supabase session helper is a separate file at `src/lib/supabase/middleware.ts`. **Never import from `src/lib/supabase/server.ts` inside the proxy** — it pulls in `next/headers`, which is incompatible with Edge Runtime.

### Auth is client-side only

Login uses `createBrowserClient` (from `@supabase/ssr`) and navigates via `window.location.href = "/admin"` after success. Do not use a Server Action for sign-in: in Next.js 16, cookies set inside a Server Action are not reliably forwarded when `redirect()` is called, causing a session loop. The proxy reads the session from cookies and checks the role using a service-role client.

### Two Supabase clients

- **`createClient()`** (`src/lib/supabase/server.ts`) — uses `@supabase/ssr`, respects the user's session cookies, subject to RLS. Use in Server Components and Route Handlers.
- **`createServiceClient()`** (`src/lib/supabase/server.ts`) — raw `supabase-js` with the service role key, bypasses RLS entirely. Use only in Server Actions, Inngest functions, and admin-side logic. Never import into a Client Component or the proxy file.

### Server Action pattern

Mutations use Server Actions in `actions.ts` files co-located with the route. The standard return type is:

```ts
export type ActionState = { error: string } | null;
```

Forms use `useActionState` for inline error display. Server Actions have a 10 MB body size limit (set in `next.config.ts`) to support photo/cover uploads.

### Bar POS

The Flames Lounge POS lives at `/bar` (bartenders) and `/admin/bar/*` (label admin). Key patterns:

- **Money is whole JMD dollars** — owner decision 2026-08-09 (`docs/decisions.md`). No price, cost, or tip is ever a fraction of a dollar. `game_sessions.price_jmd` is the correct model; **do not migrate it to cents.**
- **Cents are being removed** — `price_cents` / `cost_cents` / `total_cents` / `tip_cents` / `unit_cost_cents` are *legacy* (JMD × 100, e.g. $200 = `20000`) and are scheduled for conversion to dollar columns; see `docs/next-session-prompt.md` Priority 1. Until that migration ships they remain **authoritative** — keep treating them as cents. Do not add new `_cents` columns.
- **Jamaica timezone** — all "today" queries must use `jamaicaMidnight()` from `src/lib/bar/pos.ts`. Jamaica is UTC-5 year-round (no DST); midnight Jamaica = 05:00 UTC. Never use `new Date().setHours(0,0,0,0)` for bar queries (that gives UTC midnight).
- **Time display** — use `jamaicaTime()` / `jamaicaDateTime()` from `src/lib/bar/pos.ts` for all bar timestamps.
- **is_bartender flag** — artists can hold both portal and bar access. The proxy and `requireBarStaff()` accept `is_bartender = true` alongside `role = 'bartender'`. Grant via Admin → Bar → Staff → "Promote Existing Artist". Revoke via the same page (sets flag to `false`, does not ban the artist).
- **Shared bar utilities** (`src/lib/bar/pos.ts`) — `formatCents`, `jamaicaMidnight`, `jamaicaTime`, `jamaicaDateTime`, `CATEGORY_LABELS`, `CATEGORY_ORDER`. All bar pages import from here; never duplicate these.
- **Categories** — `drink`, `beverage`, `food`, `snack`, `game_time`. The `pos_items_category_check` constraint must be updated in a migration before adding new categories.

### Production retirement — October 8, 2026

Frank authorized full removal of the legacy AI Studio and production navigation, followed by commit, push and deployment. The old image, copy, campaign, video-generation and production-job pages and workers are removed. Old artist video request URLs redirect to saved-video libraries. Only completed videos appear in those libraries.

Keep catalog editing, normal media uploads, saved songs/videos, visibility controls and the shared YouTube upload worker. Keep stored data, storage buckets and applied migrations. No database or media deletion is authorized. The physical recording-studio business offering is separate from these software tools.

Current work and verification: `/Users/frankknight/Claude OS/Delegations/remove-all-remaining-one-flame-studio-navigation-and-tools-a.md`. Release evidence is recorded in `docs/session-handoffs/2026-10-08-total-studio-removal.md`.

## Conventions

**Server vs client.** Default to Server Components. Add `"use client"` only for state, effects, or browser APIs. Fetch data on the server.

**Database access.** Never call Supabase from a Client Component. Mutations go through Server Actions or Route Handlers.

**File naming.** Components are `PascalCase.tsx`. Utilities are `kebab-case.ts`. Use the `@/` alias for `src/`; no relative paths deeper than one `../`.

**Database changes.** Every schema change is a numbered SQL migration. Never edit an applied migration — write a new one. Update `docs/architecture.md` in the same commit.

**Commits.** Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. One logical change per commit.

**Themes.** One palette, two moods (Sound System, since 2026-10-09). The public site is the loud poster look on `black` with yellow/red/paper blocks (see `docs/sound-system-foundation.md`); the portal, admin, bar till and gamer portal are the calm studio look on `black`/`panel` using the `studio-*` classes in `src/app/studio.css` (see `docs/studio-sound-system.md`). Both are set by the route group layout, not a runtime toggle.

**After server actions.** Use `router.refresh()` to re-fetch server data after a mutation — not `window.location.reload()`.

**Client Components in Server pages.** When an interactive element (button with `onClick`, form with state) is needed inside a page that is otherwise a Server Component, extract it into its own `PascalCaseButton.tsx` or `PascalCaseClient.tsx` and import it. Never put `onClick` directly on a JSX element in a Server Component file.

**Scrollable tables.** Use a single `overflow-x-auto` on the outer container div — do NOT nest `overflow-hidden` outer + `overflow-x-auto` inner. The nested pattern blocks touch-scroll on iOS Safari. Always add `min-w-[Npx]` to the `<table>` itself so columns don't collapse before the scroll kicks in. Pattern: the `studio-table-wrap` container from `docs/studio-sound-system.md` around `<table className="w-full min-w-[Npx]">`.

## Things to never do

- Never bypass Row-Level Security with the service role key in client-reachable code.
- Never store full media files in the database. Use Supabase Storage; keep URLs in tables.
- Never call Supabase from a Client Component.
- Never deploy a destructive migration to production without backing up first.
- Never use a real artist's email or PII in seed data or test fixtures.
- Never modify `CLAUDE.md`, `docs/project-memory.md`, or `docs/decisions.md` silently — these are the project memory.
- Never call platform social APIs directly — route through the Make.com webhook.

## Brand quick reference

For brand, colours, type, copy rules and social posts, read `design-system/README.md` (the source of truth; `docs/brand.md` only points there). The essentials:

- **Sound black** `#0F0D0B` — the ground for every screen
- **Poster yellow** `#F2C230` — headline blocks, the one main button, money
- **Flame red** `#C8321F` — artist pages, release tags, the Lounge
- **Paper** `#FFF7E6` — long reading and forms
- **Inner green** `#2F6B3A` — small doses only: open, live, paid, done
- The logo keeps its own oxblood and olive; use the light version (`public/brand/*-light.svg`) on black or red.

Fonts loaded via `next/font`: **Big Shoulders** at its Display cut (`font-poster`: headlines, names, numbers, uppercase) and **Archivo** (`font-text`: everything read). No gradients, glows, soft shadows, rounded cards or emoji.

## Environment variables

Full list in `.env.example`.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- `SOCIAL_WEBHOOK_URL` — Make.com webhook for all social posting
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
## Roles

| Role | Home route | Access |
|------|-----------|--------|
| `admin` | `/admin` | Everything |
| `artist` | `/portal` | Artist portal only |
| `bartender` | `/bar` | Bar POS only |
| `gamer` | `/gamer` | Gamer portal only |
| `artist` + `is_bartender=true` | `/portal` | Artist portal + bar POS |

`roleHome()` in `src/proxy.ts` maps roles to their home route. `requireBarStaff()` in `src/lib/auth.ts` accepts admin, bartender, or is_bartender flag.

## Current phase

Phases 1–5 and the Bar POS are complete and operational. Next: first live bar session (open real tab, close as cash). Content entry (artists, releases, news) is ongoing via admin. See `docs/project-memory.md` for live status.

## End of session checklist

1. Update `docs/project-memory.md` — what got done, blockers, next session goal.
2. Refresh `docs/next-session-prompt.md` with the top priorities for next time.
3. If a non-obvious architectural decision was made, append an entry to `docs/decisions.md`.
4. Commit and push.
