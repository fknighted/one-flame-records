# One Flame Records — Claude Code context

This file is the source of truth for working on this project. Read it at the start of every session.

## What we're building

A web platform for One Flame Records, a Jamaican record label based in Montego Bay. Three audiences:

1. **The public** — discover the label, artists, releases, and videos via the public site (oneflamerecords.com).
2. **Signed artists** — log in to a portal to manage their profile, upload demos and instrumentals, and request automated music videos.
3. **The label (admin)** — manage artists, releases, videos, and approve new signups via QR application.

## Stack

- **Next.js 15** (App Router, TypeScript, Server Components by default)
- **Tailwind CSS** for styling — custom theme tokens defined in `docs/brand.md`
- **Supabase** — Postgres, Auth, Storage, Row-Level Security
- **Resend** — transactional email (signup, approvals, video-ready notifications)
- **Inngest** — durable workflow orchestration for the video automation pipeline
- **Vercel** — hosting, edge functions, preview deployments
- **GitHub** — source control, deploy hooks to Vercel

Side stack still in use elsewhere in the business (do not pull into this repo): Make.com for ops glue, Airtable for the chef-service scenario.

## Repo map

```
/
├── CLAUDE.md                  ← you are here
├── PROGRESS.md                ← living status, update at end of every session
├── DECISIONS.md               ← append-only architectural decision log
├── README.md                  ← public-facing repo intro
├── docs/
│   ├── architecture.md       ← data model, RLS, routes, env vars
│   ├── brand.md              ← palette, typography, voice, components
│   ├── video-pipeline.md     ← Inngest design, model interface
│   └── operations.md         ← runbook for common admin tasks
├── phases/
│   ├── phase-1-admin-foundation.md
│   ├── phase-2-public-site.md
│   ├── phase-3-qr-onboarding.md
│   └── phase-4-video-automation.md
├── src/
│   ├── app/                   ← Next.js routes
│   │   ├── (public)/         ← cream-themed public pages
│   │   ├── (portal)/         ← ink-black-themed artist portal
│   │   ├── admin/            ← label admin dashboard
│   │   ├── signup/[code]/    ← QR onboarding flow
│   │   └── api/              ← route handlers
│   ├── components/            ← shared UI components
│   ├── lib/
│   │   ├── supabase/         ← server + browser clients
│   │   ├── inngest/          ← function definitions
│   │   ├── video/            ← model-agnostic clip generation
│   │   └── email/            ← Resend templates
│   └── types/                 ← shared TypeScript types
├── supabase/
│   ├── migrations/            ← SQL migrations, versioned
│   └── seed.sql              ← local dev seed data
└── .env.example
```

## Conventions

**File naming.** Routes use Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`). Components are `PascalCase.tsx`. Utilities are `kebab-case.ts`. One default export per file unless there's a good reason.

**Imports.** Use the `@/` alias for anything in `src/`. No relative paths with more than one `../`.

**Server vs client.** Default to Server Components. Add `"use client"` only when you need state, effects, or browser APIs. Data fetching happens on the server, not in `useEffect`.

**Database access.** Never call Supabase from a Client Component. Use the server client in Server Components and Route Handlers. Mutations go through Server Actions or Route Handlers, never directly from the browser.

**Styling.** Use Tailwind utility classes with the custom theme tokens from `docs/brand.md`. No inline styles. No CSS modules unless absolutely necessary. Two themes: `cream` (default, public site) and `ink` (artist portal, video pages). Theme switches via a wrapper class on the layout, not a context.

**Errors.** Throw real errors with descriptive messages. Catch at route boundaries. Surface user-friendly messages in the UI, log the technical detail. Never `catch (e) {}`.

**Database changes.** Every schema change is a numbered SQL migration in `supabase/migrations/`. Never edit a previous migration once it's been applied — write a new one. Update `docs/architecture.md` in the same commit.

**Commits.** Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. One logical change per commit.

## Things to never do

- Never commit secrets or `.env` files. Use `.env.example` for templates.
- Never bypass Row-Level Security with the service role key in client-reachable code.
- Never store full media files in the database. Use Supabase Storage and keep URLs in tables.
- Never embed copyrighted lyrics, sheet music, or third-party artist material in the codebase or content.
- Never use a real artist's email or PII in seed data or test fixtures.
- Never deploy a destructive migration to production without backing up first.
- Never modify `CLAUDE.md`, `PROGRESS.md`, or `DECISIONS.md` silently — these are the project memory.

## Current phase

See `PROGRESS.md` for live status. Phase plans with concrete tasks live in `phases/`. Do not start work on a later phase before the current one's acceptance criteria are met.

## Brand quick reference

Full system in `docs/brand.md`. The essentials:

- **Oxblood** `#8B2A1F` — primary ink, headlines, the flame
- **Forest** `#3F5A3A` — secondary ink, inner flame, accents
- **Cream** `#ECE2C8` — public site background
- **Ink** `#1A1612` — portal and media background
- **Bone** `#F5EDD8` — text on ink black
- **Ochre** `#B8893B` — CTA buttons, badges, hover (use sparingly)

The site lives in two visual worlds: cream for the public-facing experience (Studio One sleeve homage), ink for the artist portal and video-heavy pages (the studio). Logo works in both.

## Environment variables

Full list in `.env.example`. Required for any phase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)
- `RESEND_API_KEY`
- `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` (Phase 4)
- `KLING_API_KEY` (Phase 4, model-agnostic — see `docs/video-pipeline.md`)

## Common commands

```bash
# Development
npm run dev                    # Next.js dev server with Turbopack
npx supabase start             # local Supabase
npx inngest-cli dev            # local Inngest dev server (Phase 4)

# Database
npx supabase migration new <name>     # create a new migration
npx supabase db push                  # apply migrations to local
npx supabase db push --linked         # apply migrations to remote
npx supabase gen types typescript --linked > src/types/supabase.ts

# Build & ship
npm run build                  # production build
npm run lint                   # lint check
npm run typecheck              # tsc --noEmit
git push origin main           # triggers Vercel deploy
```

## How to end a session

Before stopping, always:

1. Update `PROGRESS.md` — current state, what got done, what's blocked, next session goal.
2. If a non-obvious architectural decision was made, append an entry to `DECISIONS.md`.
3. Commit and push. No work lives only on your laptop.

This is how the project keeps continuity across sessions and across people.
