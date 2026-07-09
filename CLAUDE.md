# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What we're building

A web platform for One Flame Records, a Jamaican record label based in Montego Bay. Three audiences:

1. **The public** — discover the label, artists, releases, and videos via the public site (oneflamerecords.com).
2. **Signed artists** — log in to a portal to manage their profile, upload demos and instrumentals, and request automated music videos.
3. **The label (admin)** — manage artists, releases, videos, campaigns, news, and approve new signups via QR application.
4. **Bartenders** — log in to `/bar` to run the Flames Lounge POS (tabs, menu items, game sessions). Artists can also be bartenders via `profiles.is_bartender = true` flag.
5. **Gamers** — log in to `/gamer` to view their Flames Lounge gaming membership, balance, and session history.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Components by default)
- **Tailwind CSS v4** — CSS-first config, brand tokens defined in `src/app/globals.css` `@theme inline` block (no `tailwind.config.ts`)
- **Supabase** — Postgres, Auth, Storage, Row-Level Security
- **Resend** — transactional email
- **Inngest** — durable workflow orchestration for the video and campaign pipelines
- **Anthropic SDK + OpenAI** — campaign copy and image generation inside Inngest functions
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
├── brand.md               ← palette, typography, voice, components
├── video-pipeline.md      ← Inngest design, model interface
├── operations.md          ← runbook for common admin tasks
├── Creative Systems Overview.md  ← full reference doc (for ChatGPT/Claude Web upload)
└── phases/                ← phase-1…phase-5 build plans
```

Source:

```
src/
├── app/
│   ├── (public)/      ← cream-theme public site (home, artists, releases, videos, news, about, contact, signup, flames-lounge, gamer-signup)
│   ├── admin/         ← ink-theme label admin (artists, releases, videos, news, campaigns, applications, jobs, AI studio, bar/*)
│   ├── portal/        ← ink-theme artist portal (profile, assets, releases, videos)
│   ├── bar/           ← ink-theme bartender POS (tabs, inventory, sessions, members)
│   ├── gamer/         ← ink-theme gamer portal (dashboard, session history)
│   ├── login/         ← shared login page
│   ├── auth/          ← callback, portal-invite, set-password pages
│   └── api/inngest/   ← Inngest webhook route handler
├── components/        ← shared UI components (PascalCase)
├── lib/
│   ├── supabase/      ← client.ts, server.ts, middleware.ts
│   ├── inngest/       ← client.ts + functions/ (generate-video, generate-campaign, generate-campaign-video)
│   ├── video/         ← provider adapters (kie, kling, higgsfield, runway, pika) + assemble + types
│   ├── social/        ← meta.ts, tiktok.ts (fire Make.com webhook, do not call platform APIs directly)
│   ├── audio/         ← analyze.ts, transcribe.ts
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

There are no automated tests. Type checking (`npm run typecheck`) is the primary correctness gate before shipping.

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

- **Prices are in cents** — `price_cents` is JMD × 100 (e.g. $200 JMD = `20000`).
- **Jamaica timezone** — all "today" queries must use `jamaicaMidnight()` from `src/lib/bar/pos.ts`. Jamaica is UTC-5 year-round (no DST); midnight Jamaica = 05:00 UTC. Never use `new Date().setHours(0,0,0,0)` for bar queries (that gives UTC midnight).
- **Time display** — use `jamaicaTime()` / `jamaicaDateTime()` from `src/lib/bar/pos.ts` for all bar timestamps.
- **is_bartender flag** — artists can hold both portal and bar access. The proxy and `requireBarStaff()` accept `is_bartender = true` alongside `role = 'bartender'`. Grant via Admin → Bar → Staff → "Promote Existing Artist". Revoke via the same page (sets flag to `false`, does not ban the artist).
- **Shared bar utilities** (`src/lib/bar/pos.ts`) — `formatCents`, `jamaicaMidnight`, `jamaicaTime`, `jamaicaDateTime`, `CATEGORY_LABELS`, `CATEGORY_ORDER`. All bar pages import from here; never duplicate these.
- **Categories** — `drink`, `beverage`, `food`, `snack`, `game_time`. The `pos_items_category_check` constraint must be updated in a migration before adding new categories.

### Inngest pipeline

- **`generate-video`** — artist or admin requests an AI music video; triggers `video/generate.requested`
- **`generate-campaign`** — creates all content pieces for a campaign using Claude (plan) + Claude (copy/articles) + OpenAI `gpt-image-1` (images); triggers `campaign/generate.requested`
- **`generate-campaign-video`** — generates video for a specific piece; triggers `campaign/video.requested`

Inngest functions always use `createServiceClient()` and initialize Anthropic/OpenAI clients lazily inside `step.run()` to avoid build-time failures.

Claude responses in Inngest: always strip markdown code fences before `JSON.parse`. Normalize field names defensively (e.g. `angle ?? creative_angle ?? description`).

### Video style presets and cultural authenticity

`STYLE_PRESETS` arrays in `src/components/VideoRequestForm.tsx` and `src/components/AdminVideoRequestForm.tsx` must always be identical — 16 options as of session 39.

The Claude system prompt in `src/lib/video/prompt-scenes.ts` (`buildSystemPrompt()`) contains a **mandatory cultural authenticity directive**: every human subject must be a Jamaican person described through visual specifics — skin tones from deep ebony through warm caramel, authentic Jamaican hairstyles, genuine Jamaican dress and settings. The directive instructs Claude to describe subjects by visible appearance and cultural setting rather than by racial labels, because Kling/kie.ai content moderation flags explicit racial group designations. Do not remove or weaken the intent — it is a creative and cultural requirement from the label. Do not revert to explicit racial exclusion language — that breaks the video pipeline.

### Social posting via Make.com

Never call Instagram, Facebook, or TikTok APIs directly. All social posting fires a JSON payload to `SOCIAL_WEBHOOK_URL` (Make.com webhook) with fields: `platform`, `piece_id`, `content_type`, `caption`, `image_url`, `video_url`. Make.com routes by `platform` to the appropriate native module. TikTok video upload has no Make.com module — manual posting only.

### Tailwind v4 — CSS-first

Brand tokens (`--color-oxblood`, `--color-cream`, etc.) are defined in `src/app/globals.css` inside an `@theme inline` block. There is no `tailwind.config.ts`. The `docs/brand.md` doc shows a `tailwind.config.ts` excerpt that is illustrative only — ignore it.

### Video provider abstraction

`src/lib/video/` wraps multiple providers (kie, kling, higgsfield, runway, pika). The active provider is set by `DEFAULT_VIDEO_MODEL` env var. `kie` is the default — it proxies to Kling, Veo 3, Seedance, etc. via kie.ai.

## Conventions

**Server vs client.** Default to Server Components. Add `"use client"` only for state, effects, or browser APIs. Fetch data on the server.

**Database access.** Never call Supabase from a Client Component. Mutations go through Server Actions or Route Handlers.

**File naming.** Components are `PascalCase.tsx`. Utilities are `kebab-case.ts`. Use the `@/` alias for `src/`; no relative paths deeper than one `../`.

**Database changes.** Every schema change is a numbered SQL migration. Never edit an applied migration — write a new one. Update `docs/architecture.md` in the same commit.

**Commits.** Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. One logical change per commit.

**Themes.** Two visual worlds: `cream` (public site, `#ECE2C8` bg) and `ink` (portal + admin, `#1A1612` bg). Theme is a wrapper class on the route group layout, not a context or runtime toggle.

**After server actions.** Use `router.refresh()` to re-fetch server data after a mutation — not `window.location.reload()`.

**Client Components in Server pages.** When an interactive element (button with `onClick`, form with state) is needed inside a page that is otherwise a Server Component, extract it into its own `PascalCaseButton.tsx` or `PascalCaseClient.tsx` and import it. Never put `onClick` directly on a JSX element in a Server Component file.

**Scrollable tables.** Use a single `overflow-x-auto` on the outer container div — do NOT nest `overflow-hidden` outer + `overflow-x-auto` inner. The nested pattern blocks touch-scroll on iOS Safari. Always add `min-w-[Npx]` to the `<table>` itself so columns don't collapse before the scroll kicks in. Pattern: `<div className="border border-bone/10 rounded-lg overflow-x-auto"><table className="w-full min-w-[Npx]">`.

## Things to never do

- Never bypass Row-Level Security with the service role key in client-reachable code.
- Never store full media files in the database. Use Supabase Storage; keep URLs in tables.
- Never call Supabase from a Client Component.
- Never deploy a destructive migration to production without backing up first.
- Never use a real artist's email or PII in seed data or test fixtures.
- Never modify `CLAUDE.md`, `docs/project-memory.md`, or `docs/decisions.md` silently — these are the project memory.
- Never call platform social APIs directly — route through the Make.com webhook.

## Brand quick reference

Full system in `docs/brand.md`. The essentials:

- **Oxblood** `#8B2A1F` — headlines, the flame
- **Forest** `#3F5A3A` — accents, inner flame
- **Cream** `#ECE2C8` — public site background
- **Ink** `#1A1612` — portal/admin background
- **Bone** `#F5EDD8` — body text on ink
- **Ochre** `#B8893B` — CTA buttons, badges, hover states (use sparingly)

Fonts loaded via `next/font`: **Fraunces** (display/headlines), **Inter** (body).

## Environment variables

Full list in `.env.example`.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- `ANTHROPIC_API_KEY` — campaign copy generation
- `OPENAI_API_KEY` — `gpt-image-1` image generation in campaign pipeline
- `SOCIAL_WEBHOOK_URL` — Make.com webhook for all social posting
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- `KIE_API_KEY` — default video model provider (kie.ai)
- `DEFAULT_VIDEO_MODEL` — `kie` | `kling` | `higgsfield` | `runway` | `pika`

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
