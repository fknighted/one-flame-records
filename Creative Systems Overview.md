# One Flame Records — Creative Systems Overview

> **Purpose of this document:** A complete, self-contained reference for the entire One Flame Records web platform. Written for upload into an AI assistant (ChatGPT, Claude Web, etc.) for analysis, Q&A, or onboarding. Covers every layer: product design, data architecture, authentication, business logic, AI pipelines, POS system, security model, and deployment.

---

## Table of Contents

1. [What This Platform Is](#1-what-this-platform-is)
2. [Technology Stack](#2-technology-stack)
3. [Design System](#3-design-system)
4. [Repository Layout](#4-repository-layout)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Database Schema](#6-database-schema)
7. [Row-Level Security (RLS)](#7-row-level-security-rls)
8. [Storage Buckets](#8-storage-buckets)
9. [Route Map](#9-route-map)
10. [Server / Client Component Patterns](#10-server--client-component-patterns)
11. [Public Site](#11-public-site)
12. [Artist Portal](#12-artist-portal)
13. [Admin Panel](#13-admin-panel)
14. [AI Video Pipeline](#14-ai-video-pipeline)
15. [AI Campaign Pipeline](#15-ai-campaign-pipeline)
16. [Social Posting via Make.com](#16-social-posting-via-makecom)
17. [Flames Lounge Bar POS](#17-flames-lounge-bar-pos)
18. [Gamer Portal](#18-gamer-portal)
19. [Email System](#19-email-system)
20. [Durable Workflows with Inngest](#20-durable-workflows-with-inngest)
21. [Error Tracking — Sentry](#21-error-tracking--sentry)
22. [Deployment — Vercel](#22-deployment--vercel)
23. [Environment Variables](#23-environment-variables)
24. [Security Model](#24-security-model)
25. [Key Conventions & Rules](#25-key-conventions--rules)
26. [Complete Data Flow: Video Request End-to-End](#26-complete-data-flow-video-request-end-to-end)

---

## 1. What This Platform Is

**One Flame Records** is an independent reggae and dancehall record label based in Montego Bay, Jamaica. This web platform (`oneflamerecords.com`) serves five distinct audiences through a single Next.js application:

| Audience | Entry Route | What They Do |
|----------|-------------|--------------|
| **Public** | `/` | Discover the label, artists, releases, music videos, and news |
| **Signed Artists** | `/portal` | Manage their profile, upload demos/instrumentals, request AI-generated music videos |
| **Label Admin** | `/admin` | Manage everything: artists, releases, videos, news, campaigns, QR signups, bar operations |
| **Bartenders** | `/bar` | Run the Flames Lounge POS — open tabs, add items, close tabs, manage game sessions |
| **Gamers** | `/gamer` | View their Flames Lounge gaming membership, balance, and session history |

The platform is currently **live and operational**. All five portals are complete. The bar has run real tabs. AI video generation is active. Content (artists, releases, news) is being entered via admin.

---

## 2. Technology Stack

### Core Framework
- **Next.js 16** with the App Router (not Pages Router). TypeScript throughout. Server Components are the default — `"use client"` is added only when state, effects, or browser APIs are needed.
- **Turbopack** for local development (`npm run dev`).
- **Vercel** for hosting. Push to `main` → automatic deploy.

### Database & Auth
- **Supabase** — Postgres database, Supabase Auth, Supabase Storage, Row-Level Security.
- Two Supabase clients used in the codebase:
  - `createClient()` in `src/lib/supabase/server.ts` — respects session cookies, subject to RLS. Used in Server Components and Route Handlers.
  - `createServiceClient()` in `src/lib/supabase/server.ts` — uses service role key, bypasses RLS entirely. Used in Server Actions, Inngest functions, and admin-side logic **only**. Never exposed to client code.

### Styling
- **Tailwind CSS v4** — CSS-first configuration. No `tailwind.config.ts`. Brand tokens (colors, fonts) are declared in `src/app/globals.css` inside an `@theme inline` block. This is important: any reference to a `tailwind.config.ts` in older docs is illustrative only and does not exist in this repo.

### AI & Automation
- **Anthropic SDK (claude-sonnet-4-6)** — scene prompt generation for videos, campaign content planning, caption and article writing.
- **OpenAI (gpt-image-1)** — AI image generation for campaign pieces.
- **Inngest** — durable workflow orchestration. The video generation and campaign pipelines run as Inngest functions, not as standard Vercel serverless functions. This gives them retry logic, step-level checkpointing, parallel execution, and cancellation.
- **Make.com** — all social media posting (Instagram, Facebook, TikTok). The app fires a JSON webhook to Make.com; Make.com's native modules post to each platform. The app never calls platform APIs directly.

### Media Processing
- **fluent-ffmpeg + @ffmpeg-installer/ffmpeg** — video assembly. Downloads AI-generated clips and the source audio, concatenates clips, optionally burns a title card, encodes to H.264/AAC MP4.
- **music-metadata** — audio duration and BPM analysis.
- **Whisper via OpenAI API** — audio transcription for lyric extraction.

### Email
- **Resend** — transactional email (artist notifications, application receipts).

### Error Tracking
- **Sentry** — active in production. Wraps `next.config.ts` via `withSentryConfig`.

### Other
- **Spotify Web API** (`src/lib/spotify.ts`) — fetches artist/album data for public pages.
- **next/font** — Fraunces (display/headlines) and Inter (body) loaded via the font subsystem for performance.

---

## 3. Design System

### Two Visual Worlds

The platform splits into two completely separate visual environments. They are never mixed on the same page.

| World | Where | Background | Feel |
|-------|-------|------------|------|
| **Cream** | Public site | `#ECE2C8` | Printed record sleeve. Paper grain. Restrained ink. |
| **Ink** | Portal, Admin, Bar, Gamer | `#1A1612` | Studio mode. Dark background so media pops. |

Theme is applied via a wrapper class on the route group layout (`bg-cream` or `bg-ink`), not a runtime context or toggle.

### Color Tokens (defined in `src/app/globals.css` `@theme inline` block)

| Token | Hex | Role |
|-------|-----|------|
| `--color-oxblood` | `#8B2A1F` | Headlines, the flame mark, primary ink |
| `--color-forest` | `#3F5A3A` | Secondary ink, inner flame, accent |
| `--color-cream` | `#ECE2C8` | Public site background |
| `--color-ink` | `#1A1612` | Portal/admin background |
| `--color-bone` | `#F5EDD8` | Body text on ink backgrounds |
| `--color-ochre` | `#B8893B` | CTA buttons, badges, hover states — use sparingly |

### Typography

Loaded via `next/font`:
- **Fraunces** — display/headlines (chunky retro slab serif, vintage reggae sleeve aesthetic)
- **Inter** — body text

### Paper Grain Overlay (Public Site Only)

A fixed `<div>` in the public layout renders a fractal noise SVG at `opacity-[0.055]` with `mix-blend-multiply`. This gives the cream pages a subtle printed-paper texture. It is `pointer-events-none` and `z-50` so it overlays everything without blocking interaction. It does NOT appear on ink-theme pages.

### Brand Voice

Confident, grounded, specific. "Pressed in Montego Bay." Never corporate, never theme-park Jamaican. Copy feels like the back of a record sleeve, not a tourism ad.

---

## 4. Repository Layout

```
/
├── src/
│   ├── app/
│   │   ├── (public)/          ← cream theme — public site
│   │   ├── admin/             ← ink theme — label admin
│   │   ├── portal/            ← ink theme — artist portal
│   │   ├── bar/               ← ink theme — bartender POS
│   │   ├── gamer/             ← ink theme — gamer portal
│   │   ├── login/             ← shared login page
│   │   ├── auth/              ← callback, portal-invite, set-password
│   │   ├── signup/[code]/     ← QR landing page (public)
│   │   └── api/inngest/       ← Inngest webhook endpoint
│   ├── components/            ← shared UI components (PascalCase.tsx)
│   ├── lib/
│   │   ├── supabase/          ← client.ts, server.ts, middleware.ts
│   │   ├── inngest/           ← client.ts + functions/
│   │   ├── video/             ← provider adapters + assemble + types
│   │   ├── social/            ← meta.ts, tiktok.ts
│   │   ├── audio/             ← analyze.ts, transcribe.ts
│   │   ├── email/             ← send.ts
│   │   ├── bar/               ← pos.ts (shared bar utilities)
│   │   ├── auth.ts            ← requireAdmin(), requireBarStaff()
│   │   └── spotify.ts
│   ├── proxy.ts               ← Next.js middleware (route protection)
│   └── types/supabase.ts      ← auto-generated DB types
├── supabase/
│   ├── migrations/            ← numbered SQL migrations (40+ files)
│   └── seed.sql
├── architecture.md
├── brand.md
├── video-pipeline.md
├── operations.md
├── PROGRESS.md
├── DECISIONS.md
└── CLAUDE.md
```

---

## 5. Authentication & Authorization

### Auth Provider
Supabase Auth. A single auth instance handles all five user types (admin, artist, bartender, gamer, public). Role differentiation is done via the `profiles` table, not separate auth systems.

### Login Flow
1. User visits `/login` (shared for all roles).
2. Login form uses `createBrowserClient` from `@supabase/ssr` — **client-side only**.
3. On success: `window.location.href = "/admin"` (or `/portal` depending on role). Hard navigation, not `router.push()`.
4. Why not Server Action? In Next.js 16, cookies set inside a Server Action are not reliably forwarded when `redirect()` is called. This would cause a session loop. Client-side login with `window.location.href` avoids this.

### Middleware — `src/proxy.ts`
The route protection middleware lives at `src/proxy.ts` (not `src/middleware.ts`) and exports `proxy` and `config`. It runs on every request that isn't a static asset.

**What it does:**
1. Calls `updateSession()` from `src/lib/supabase/middleware.ts` to refresh the Supabase session cookie.
2. Checks if the path starts with `/admin`, `/portal`, `/bar`, or `/gamer`.
3. If the route is protected and there is no user → redirect to `/login?next=<path>`.
4. If there is a user, looks up `profiles.role` and `profiles.is_bartender` using the **service role client** (inline, not imported from `server.ts` — `server.ts` uses `next/headers` which is incompatible with Edge Runtime).
5. Enforces role-based access:
   - `/admin` requires `role = 'admin'`
   - `/portal` requires `role = 'artist'`
   - `/bar` requires `role = 'admin'` OR `role = 'bartender'` OR `is_bartender = true`
   - `/gamer` requires `role = 'gamer'` OR `role = 'admin'`
6. Wrong-role access → redirect to `roleHome(role)` (the user's correct home).

**Critical constraint:** Never import from `src/lib/supabase/server.ts` inside `proxy.ts`. That file imports `next/headers`, which is incompatible with Edge Runtime where the middleware executes.

### Role Map

| `profiles.role` | Home | Access |
|-----------------|------|--------|
| `admin` | `/admin` | Everything |
| `artist` | `/portal` | Artist portal; bar if `is_bartender = true` |
| `bartender` | `/bar` | Bar POS only |
| `gamer` | `/gamer` | Gamer portal only |

### Server-Side Auth Guards
- `requireAdmin()` in `src/lib/auth.ts` — call at the top of any Server Action that mutates data. Throws if the caller is not an authenticated admin. Used in all admin Server Actions.
- `requireBarStaff()` — accepts admin, bartender, or artist with `is_bartender = true`. Used in all bar Server Actions.

### Profiles Table Trigger
When a new user is created in `auth.users`, a Postgres trigger automatically inserts a row in `profiles` with `role = 'artist'` (default). Admin manually changes the role afterward if needed.

### Artist Invitations
Admins can invite artists via `/admin/artists/[id]` → send portal invite. This sends a Supabase Auth invitation email. The artist follows the link to `/auth/portal-invite`, sets a password, and their profile is linked to their `artist_id`.

---

## 6. Database Schema

All tables use `uuid` primary keys with `gen_random_uuid()` default, and `created_at` / `updated_at` timestamps. An `updated_at` trigger keeps that column fresh automatically.

### `profiles`
One row per auth user. The bridge between Supabase Auth and application roles.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | FK → `auth.users.id` |
| `role` | text | `'admin'`, `'artist'`, `'bartender'`, `'gamer'` |
| `artist_id` | uuid nullable | FK → `artists.id`, set on approval |
| `is_bartender` | boolean | Artists who also work the bar |

### `artists`
The label roster.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `slug` | text unique | URL-safe stage name |
| `stage_name` | text | Display name |
| `legal_name` | text nullable | Internal only |
| `bio` | text | Markdown allowed |
| `photo_url` | text nullable | Public Storage URL |
| `hometown` | text nullable | |
| `genres` | text[] | e.g. `{reggae, dancehall}` |
| `socials` | jsonb | `{instagram, tiktok, twitter, youtube}` |
| `streaming` | jsonb | `{spotify_id, apple_id, soundcloud_url}` |
| `status` | text | `'pending'`, `'active'`, `'archived'` |
| `featured_order` | int nullable | Lower = higher on homepage |

### `releases`
Albums, EPs, singles.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `artist_id` | uuid | FK → `artists.id` |
| `title` | text | |
| `slug` | text unique | |
| `type` | text | `'single'`, `'ep'`, `'album'`, `'mixtape'` |
| `release_date` | date | |
| `cover_url` | text | Storage URL |
| `description` | text nullable | |
| `streaming_links` | jsonb | `{spotify, apple, youtube, soundcloud, tidal}` |
| `featured` | boolean | |

### `videos`
YouTube music videos, lyric videos, behind-the-scenes. Separate from AI-generated videos.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `artist_id` | uuid | FK → `artists.id` |
| `release_id` | uuid nullable | FK → `releases.id` |
| `title` | text | |
| `youtube_id` | text | 11-char YouTube video ID |
| `kind` | text | `'music_video'`, `'lyric'`, `'live'`, `'behind_scenes'`, `'generated'` |
| `published_at` | timestamptz | |
| `featured` | boolean | |

### `assets`
Artist file uploads — instrumentals, demos, reference clips, reference images. Stored in private Supabase Storage.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `artist_id` | uuid | FK → `artists.id` |
| `kind` | text | `'instrumental'`, `'demo'`, `'reference_video'`, `'reference_image'` |
| `title` | text | |
| `storage_path` | text | Path in `private-assets` bucket |
| `mime_type` | text | |
| `size_bytes` | bigint | |
| `duration_seconds` | int nullable | Audio/video only |
| `notes` | text nullable | |
| `is_public` | boolean | When true, visible on public artist page (signed URL generated server-side) |

### `video_jobs`
State machine for the AI video generation pipeline.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `artist_id` | uuid | FK → `artists.id` |
| `source_asset_id` | uuid | FK → `assets.id` (the source instrumental) |
| `inngest_run_id` | text nullable | For Inngest dashboard lookup |
| `status` | text | `'queued'`, `'analyzing'`, `'prompting'`, `'generating'`, `'assembling'`, `'complete'`, `'failed'` |
| `params` | jsonb | `{ stylePreset, aspectRatio, model, lyrics, creativeBrief, referenceImageIds, scenes, generatedClips }` |
| `output_url` | text nullable | Final video signed URL |
| `error` | text nullable | Error message if failed |
| `cost_estimate_usd` | numeric nullable | Total clip generation cost |
| `is_public` | boolean | When true, video appears on public site |
| `started_at`, `completed_at` | timestamptz | Pipeline timing |

**`params` JSONB sub-fields of note:**
- `params.scenes` — array of `{ start, end, prompt, aspectRatio }`. Written by the Inngest pipeline after Claude generates scene prompts. Also writable at job creation if the admin pre-approved/edited scenes in the UI.
- `params.generatedClips` — array of `ClipResult | null`, one slot per scene. Written incrementally as each clip completes. Null slots = not yet generated. Used to resume from partial failure without regenerating completed clips.
- `params.stylePreset` — one of 16 visual style options (e.g. "Vintage roots reggae performance", "Bashment party / club").
- `params.aspectRatio` — `"16:9"` | `"9:16"` | `"1:1"`.

### `signup_codes`
QR code tokens for the A&R intake form. Admin-only.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `code` | text unique | URL-safe random string, used in `/signup/<code>` |
| `label` | text | e.g. "Business card v1" |
| `is_active` | boolean | |
| `rotated_at` | timestamptz nullable | When superseded |

### `signup_applications`
Submitted via QR scan. Artists fill in stage name, email, genres, socials, message.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `code_id` | uuid | FK → `signup_codes.id` |
| `stage_name`, `legal_name`, `email`, `phone` | text | |
| `genres` | text[] | |
| `socials` | jsonb | |
| `message` | text nullable | |
| `status` | text | `'pending'`, `'approved'`, `'rejected'` |
| `reviewed_by` | uuid nullable | FK → `profiles.id` |
| `reviewed_at` | timestamptz nullable | |

### `news_posts`
Label news and announcements.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `slug` | text unique | |
| `title`, `excerpt`, `body` | text | `body` is Markdown |
| `cover_url` | text nullable | Public Storage URL |
| `category` | text | `'label'`, `'release'`, `'event'` |
| `published_at` | timestamptz nullable | |
| `is_published` | boolean | Both `is_published = true` AND `published_at <= now()` required for public access |

### Content / Campaign Tables

| Table | Purpose |
|-------|---------|
| `content_campaigns` | A marketing campaign with a title, source material, status |
| `content_pieces` | Individual content pieces within a campaign (one per platform/post type) |
| `ai_generated_images` | Log of all gpt-image-1 generated images with prompts, for cost tracking |
| `campaign_ideas` | Brainstorm ideas before turning them into a full campaign |

### Bar POS Tables

| Table | Purpose |
|-------|---------|
| `pos_items` | Menu items with price in cents, category, stock level |
| `pos_tabs` | Open and closed tabs. `status`: `'open'`, `'closed'`. `total_cents` maintained by DB function |
| `pos_tab_items` | Line items on a tab: item, quantity, price snapshot at time of order |
| `pos_sessions` | Game sessions at the lounge (start/end times, table, gamer) |
| `gamer_memberships` | Gamer portal membership, balance, and member info |
| `gamer_transactions` | Balance changes (credits, debits) for each gamer |
| `bar_regulars` | Known bar regulars with names and notes (bartender-managed reference list) |

---

## 7. Row-Level Security (RLS)

RLS is enabled on **every** table. Default deny — explicit policies grant access.

### Public Read Access
- `artists` — anyone can SELECT where `status = 'active'`
- `releases`, `videos` — anyone can SELECT
- `news_posts` — anyone can SELECT where `is_published = true AND published_at <= now()`
- `assets` — anyone can SELECT where `is_public = true`
- `video_jobs` — anyone can SELECT where `is_public = true AND status = 'complete'`

### Admin Full Access
Any user with `profiles.role = 'admin'` can SELECT, INSERT, UPDATE, DELETE on all tables.

### Artist-Scoped Access
- Artists can SELECT their own rows in `assets` and `video_jobs` (where `artist_id = profiles.artist_id`)
- Artists can UPDATE their own row in `artists`, but only `bio`, `photo_url`, `socials`, `streaming`

### Bar-Only Tables
`pos_items`, `pos_tabs`, `pos_tab_items`, `pos_sessions` — accessible to `role = 'bartender'` or `role = 'admin'` or `is_bartender = true`.

`bar_regulars` — locked to service role only (policy: `USING (false) WITH CHECK (false)`). All bar app access goes through `createServiceClient()`.

### Important: Service Role Bypasses All RLS
`createServiceClient()` uses the service role key and bypasses RLS entirely. All Inngest functions, Server Actions that need cross-user data, and admin operations use this client. It must never be imported into Client Components or the proxy middleware.

---

## 8. Storage Buckets

### `public-media`
Public read, admin write. Used for:
- Artist photos: `photos/{artist_id}/...`
- Release cover art: `covers/{release_id}/...`
- News cover images: `news/{post_id}/...`
- AI-generated campaign images: `ai-generated/campaign/{campaign_id}/{piece_id}.png`

Public URLs are used directly in `<img>` tags. No signing needed.

### `private-assets`
No public access. Signed URLs only. Used for:
- Artist uploads (instrumentals, demos, reference files): `{artist_id}/{asset_id}.{ext}`
- Signed URLs have **24-hour expiry** when passed into the Inngest pipeline (pipeline can run 2+ hours)
- Signed URLs have **1-hour expiry** for portal download links

### `generated-videos`
No public access. Final video outputs from the AI pipeline. Path: `videos/{job_id}.mp4`. Signed URLs generated at render time with **1-hour TTY** for the portal/admin view, **7-day TTL** written to `video_jobs.output_url` after assembly.

---

## 9. Route Map

### Public Routes — `src/app/(public)/` (cream theme, no auth)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Homepage: hero, featured artists, releases, generated videos, news, CTA |
| `/artists` | `artists/page.tsx` | Full artist roster |
| `/artists/[slug]` | `artists/[slug]/page.tsx` | Artist page: bio, Spotify embed, releases, public videos |
| `/releases` | `releases/page.tsx` | Full release catalog |
| `/releases/[slug]` | `releases/[slug]/page.tsx` | Release detail: Spotify album embed |
| `/videos` | `videos/page.tsx` | Public music videos + completed AI-generated videos marked public |
| `/news` | `news/page.tsx` | Published news post cards |
| `/news/[slug]` | `news/[slug]/page.tsx` | News post: Markdown body rendered via `marked` |
| `/sign` | `sign/page.tsx` | A&R intake / about the label |
| `/about` | `about/page.tsx` | Label story |
| `/contact` | `contact/page.tsx` | Contact info |
| `/signup/[code]` | `signup/[code]/page.tsx` | QR code landing: application form |
| `/flames-lounge` | `flames-lounge/page.tsx` | Lounge info / drinks menu preview |
| `/gamer-signup` | `gamer-signup/page.tsx` | Gaming membership signup |

### Artist Portal — `src/app/portal/` (ink theme, requires `role = 'artist'`)

| Route | Purpose |
|-------|---------|
| `/portal` | Dashboard: welcome, stats, quick links |
| `/portal/profile` | Edit bio, photo, social links |
| `/portal/assets` | File library: view, upload, toggle public/private |
| `/portal/assets/new` | Upload a new instrumental or demo |
| `/portal/videos` | Video job library: status, pipeline progress, public toggle |
| `/portal/videos/new` | Request a new AI video |
| `/portal/videos/[id]` | Job detail: pipeline progress, clip previews, final video |

### Admin Panel — `src/app/admin/` (ink theme, requires `role = 'admin'`)

| Route | Purpose |
|-------|---------|
| `/admin` | Overview dashboard |
| `/admin/artists` | Artist roster management |
| `/admin/artists/new` | Add new artist |
| `/admin/artists/[id]/edit` | Edit artist profile |
| `/admin/artists/[id]/assets` | Manage artist's uploaded assets |
| `/admin/artists/[id]/videos/new` | Request AI video for an artist |
| `/admin/releases` | Release catalog CRUD |
| `/admin/videos` | YouTube video CRUD |
| `/admin/news` | News post list |
| `/admin/news/new` | Create news post |
| `/admin/news/[id]/edit` | Edit news post |
| `/admin/jobs` | Video pipeline observability: all jobs, stats |
| `/admin/jobs/[id]` | Job detail: clip previews, Regenerate per-clip, Inngest logs link |
| `/admin/applications` | Review pending A&R applications |
| `/admin/codes` | Manage QR signup codes |
| `/admin/campaigns` | Content campaign list |
| `/admin/campaigns/new` | Create campaign |
| `/admin/campaigns/[id]` | Campaign detail: content pieces |
| `/admin/campaigns/[id]/pieces/[pid]` | Piece detail: caption, image, post to social |
| `/admin/bar` | Bar overview / admin view |
| `/admin/bar/menu` | Menu item CRUD |
| `/admin/bar/staff` | Bartender management + promote artist |
| `/admin/settings` | Monthly budget cap for AI image generation |

### Bar POS — `src/app/bar/` (ink theme, requires bar staff)

| Route | Purpose |
|-------|---------|
| `/bar` | Open tabs dashboard |
| `/bar/tabs/new` | Open a new tab |
| `/bar/tabs/[id]` | Active tab: add items, close tab |
| `/bar/menu` | View menu (read-only for bartenders) |
| `/bar/sessions` | Game session management |
| `/bar/members` | Gamer membership lookup |

### Gamer Portal — `src/app/gamer/` (ink theme, requires `role = 'gamer'`)

| Route | Purpose |
|-------|---------|
| `/gamer` | Dashboard: balance, membership info |
| `/gamer/sessions` | Session history |

### Auth Routes

| Route | Purpose |
|-------|---------|
| `/login` | Shared login for all roles |
| `/auth/callback` | Supabase OAuth/magic-link callback |
| `/auth/portal-invite` | Artist accepts invitation, sets password |
| `/auth/set-password` | Password reset flow |

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/inngest` | Inngest webhook (GET/POST/PUT) — registered as `serve()`. `maxDuration = 300` (Vercel Pro limit) |

---

## 10. Server / Client Component Patterns

### Default: Server Components
All pages and layouts are Server Components by default. Data is fetched directly using `await createClient()` or `await createServiceClient()`. No API routes needed for reads.

### Adding Interactivity
When a button, form state, or browser API is needed inside a Server Component page:
- Extract it as a separate `PascalCaseButton.tsx` or `PascalCaseClient.tsx` file with `"use client"` at the top.
- Import it into the page. The page stays a Server Component; only the interactive piece becomes a Client Component.
- Never add `onClick` directly on a JSX element in a `.tsx` file that lacks `"use client"`.

### Mutations: Server Actions
All mutations go through Server Actions in co-located `actions.ts` files. Standard return type:
```ts
export type ActionState = { error: string } | null;
```
Forms use `useActionState` from React for inline error display. Server Actions have a 10 MB body size limit (set in `next.config.ts`) to support photo and cover uploads.

After a mutation, use `router.refresh()` to re-fetch server data — not `window.location.reload()`.

### Never Call Supabase from Client Components
All Supabase queries happen server-side. Client Components receive data as props or trigger mutations via Server Actions.

---

## 11. Public Site

### Homepage (`/`)
Assembled from multiple database queries:
- Featured artists (`artists` where `featured_order IS NOT NULL`, ordered by `featured_order`)
- Latest releases (`releases` ordered by `release_date DESC`)
- Latest published public AI-generated videos
- Latest news posts

### Artist Page (`/artists/[slug]`)
- Loads artist by slug from `artists`
- Fetches Spotify artist data via `src/lib/spotify.ts` if `streaming.spotify_id` is set
- Shows public assets (signed URLs generated server-side via service client for private-assets bucket)
- Shows public completed video jobs

### QR Signup (`/signup/[code]`)
- Validates the code against `signup_codes`
- Renders the application form
- On submit: inserts into `signup_applications`, sends confirmation email via Resend, redirects with success message

---

## 12. Artist Portal

### Asset Uploads (`/portal/assets/new`)
Artists upload instrumentals and demos here. File is written to `private-assets` bucket at `{artist_id}/{asset_id}.{ext}`. Duration is extracted from audio metadata at upload time.

### Video Request (`/portal/videos/new`)
Same form as admin but scoped to the artist's own assets. Submits to `requestVideoAsArtist()` Server Action, which creates a `video_jobs` row and fires the Inngest `video/generate.requested` event.

### Video Job Detail (`/portal/videos/[id]`)
Shows pipeline status with animated progress dots (analyzing → prompting → generating → assembling). Uses `JobsAutoRefresh` component which polls every 30 seconds when any job is active. Once complete, shows the final video player and a public/private toggle.

---

## 13. Admin Panel

### Artist Management
Full CRUD. Photo uploads go to `public-media/photos/{artist_id}/...`. Admin can promote an existing artist to bartender (`is_bartender = true`) from `/admin/bar/staff`.

### Video Jobs (`/admin/jobs`)
Observability dashboard showing all pipeline jobs with status, cost, and process time. Auto-refreshes when active jobs exist. Each row links to the job detail page.

**Job Detail (`/admin/jobs/[id]`):**
- Shows all generated clips as video players, with the scene prompt that produced each clip
- Each clip card has a **↺ Regenerate** button (only shown when job is complete or failed) that:
  1. Creates a new job with all other clips preserved (`params.generatedClips` with only the target slot nulled)
  2. Fires Inngest to regenerate only that clip
  3. Redirects to the new job
- Shows a Watch Final Video link if complete
- Links to Inngest dashboard logs via `inngest_run_id`

**Scene Prompt Editing (Admin Video Request Form):**
Before submitting a video request, admin can click "Generate preview" to have Claude generate scene prompts. These now appear as editable textareas. Any edits are serialized as JSON into a hidden input, submitted with the form, and saved to `params.scenes`. The Inngest function skips Claude scene generation if `params.scenes` is already present.

### Applications (`/admin/applications`)
Pending A&R applications from QR scans. Approve (creates artist row, sends portal invite email) or Reject (sends rejection email).

### Campaign Studio (`/admin/campaigns`)
Create content campaigns from a release, news post, or custom brief. Triggers the AI campaign pipeline (see §15).

---

## 14. AI Video Pipeline

### Overview
An artist or admin selects an instrumental, picks a visual style, optionally provides lyrics and a creative brief, optionally edits scene prompts, then submits. The pipeline runs as an Inngest durable function and takes approximately 8–20 minutes end to end.

### Triggering
1. Form submission calls `requestVideoAsAdmin()` or `requestVideoAsArtist()` Server Action.
2. Action inserts a `video_jobs` row with `status = 'queued'` and `params = { stylePreset, aspectRatio, ... }`.
3. Action calls `inngest.send({ name: "video/generate.requested", data: { jobId } })`.
4. Inngest picks up the event and runs `generateVideo()`.

### Inngest Function Steps (`src/lib/inngest/functions/generate-video.ts`)

**Step 1 — `load-job`**
Loads the job and linked asset from DB. Generates a 24-hour signed URL for the source audio (pipeline can run 2+ hours).

**Step 2 — `mark-analyzing`**
Sets `status = 'analyzing'` and writes `started_at`.

**Step 3 — Audio analysis (parallel)**
Two steps run simultaneously via `Promise.all`:
- `analyze-audio`: uses `music-metadata` to extract BPM, duration, key, and section timestamps
- `transcribe-audio`: sends audio to OpenAI Whisper for lyric transcription

**Step 4 — `mark-prompting`**
Sets `status = 'prompting'`.

**Step 5 — Scene generation (conditional)**
If `params.scenes` is already populated (admin pre-approved or clip retry):
- Use existing scenes directly — skip Claude call entirely.

If not:
- `write-prompts`: calls Claude (claude-sonnet-4-6) with the `buildSystemPrompt()` from `src/lib/video/prompt-scenes.ts`. This includes:
  - Cultural authenticity directive: every human must be visually described as a Jamaican person with specific skin tones (deep ebony through warm caramel), authentic Jamaican hairstyles (locs, braids, afros), and genuine Jamaican dress/settings. Subjects are described by visible appearance and cultural setting, NOT racial labels (because Kling's content moderation flags explicit racial group designations).
  - Style preset context (one of 16 presets)
  - Audio features (BPM, sections, duration)
  - Lyrics if available
  - Creative brief if provided
  - Reference image descriptions if provided
  - Output: array of `{ start, end, prompt, aspectRatio }` objects — one per scene
- `save-scenes`: writes the generated scenes to `params.scenes` in the job row

**Step 6 — `mark-generating`**
Sets `status = 'generating'`.

**Step 7 — Clip generation (batched, parallel)**
Clips are generated in batches of 5. For each batch:
1. Submit all clips in the batch simultaneously via `Promise.all` — each calls `generator.submitClip()` which fires an API call to kie.ai and returns a task ID. Already-completed clips (non-null in `params.generatedClips`) are skipped.
2. Sleep 3 minutes (single wait for entire batch).
3. Poll all clips in parallel every 30 seconds via `Promise.all` — up to 60 attempts (30 min timeout).
4. As each clip completes, save it immediately to `params.generatedClips[i]` in the DB (so progress survives a crash).
5. Break when all clips in the batch are done.
6. Move to the next batch.

This parallel architecture replaced an earlier sequential design that took 60+ minutes for a 4-clip job. Now takes approximately 8–12 minutes.

**Video Provider Abstraction (`src/lib/video/`)**
The `ClipGenerator` interface has three methods: `submitClip()`, `checkClip()`, and `generateClip()`. Providers:
- `kie.ts` — default. kie.ai proxies to Kling, Veo 3, Seedance, and others.
- `kling.ts` — direct Kling API
- `higgsfield.ts`, `runway.ts`, `pika.ts` — other providers

Active provider set by `DEFAULT_VIDEO_MODEL` env var.

**Step 8 — `mark-assembling`**
Sets `status = 'assembling'`.

**Step 9 — `assemble`**
Calls `assembleVideo()` from `src/lib/video/assemble.ts`:
1. Downloads all clip video files to `/tmp`
2. Downloads source audio to `/tmp`
3. Downloads Inter Bold font to `/tmp` (cached on container warmup)
4. Runs `fluent-ffmpeg` with a complex filter:
   - Optional 3-second title card (artist name + track title in Oxblood/Bone, black background)
   - Each clip: `fps=24, format=yuv420p, trim to scene duration, scale to output resolution`
   - Concatenate all clips
   - Mix in source audio
   - Output: H.264/AAC MP4, `libx264 -preset fast -crf 28`
5. Uploads final MP4 to `generated-videos/videos/{job_id}.mp4`
6. Generates a 7-day signed URL
7. Deletes all temp files

**Step 10 — `mark-complete`**
Sets `status = 'complete'`, writes `output_url`, `completed_at`, `cost_estimate_usd`.

**Step 11 — `notify-artist`**
Looks up artist's email, sends Resend email: "Your One Flame video is ready" with a portal link.

### Retry Logic
- Inngest retries failed functions up to 2 times automatically.
- Admin can manually retry via Retry button on the jobs page, which calls `retryJob()`:
  - Creates a new job row with the same `params` (including any saved `generatedClips` and `scenes`)
  - Fires Inngest event for the new job
  - The new job skips scene generation (scenes in params) and skips already-generated clips
- Admin can regenerate a single clip via the ↺ button on the job detail page (same principle — nulls that slot, creates new job)

### Cost Tracking
Each `ClipResult` has `costEstimateUsd`. On completion, the pipeline sums these and writes to `video_jobs.cost_estimate_usd`.

### Clip URL Expiry
Clip URLs from kie.ai expire within approximately 24 hours. The job detail page notes this. Once assembled, the final video is in our own storage with a 7-day signed URL.

---

## 15. AI Campaign Pipeline

### Overview
Creates a full set of social media content pieces for a campaign: captions, images, video scripts, and news articles. Runs as an Inngest durable function.

### Triggering
Admin creates a campaign at `/admin/campaigns/new`, providing:
- Title
- Source material (release info, lyrics, news copy, or custom brief)
- Target platforms (Instagram, TikTok, Facebook, Website News)
- Pieces per platform (1–5)
- Video mode: `"script"` (human-produced) or `"generated"` (AI video pipeline)

On submit, fires `campaign/generate.requested` with `{ campaignId, platforms, piecesPerPlatform, video_mode }`.

### Inngest Function Steps (`src/lib/inngest/functions/generate-campaign.ts`)

**Step 1 — `load-campaign`**
Loads campaign from DB, sets `status = 'generating'`.

**Step 2 — `plan-content`**
Calls Claude (claude-sonnet-4-6) with platform guidelines for each target platform. Returns a JSON array of content pieces with `platform`, `content_type`, `angle`, `image_needed`, `video_mode`. Defensively normalizes field names (handles Claude occasionally outputting `creative_angle` instead of `angle`). Always strips markdown code fences before `JSON.parse`.

**Step 3 — `create-pieces`**
Inserts all piece rows into `content_pieces` table.

**Step 4 — Generate each piece (parallel)**
All pieces generated simultaneously via `Promise.all`. For each piece:
- **News post pieces:** Claude writes a structured news article (title + Markdown body, 400–700 words). Written to `content_pieces.video_script` (repurposed as article body) and `caption` (article title).
- **Social pieces:** Three sub-calls to Claude:
  1. Caption + hashtags (`content_pieces.caption`, `content_pieces.hashtags`)
  2. Video script if `video_mode = 'script'` or `'generated'` (Hook / Body / CTA format)
  3. AI image via `gpt-image-1` if `image_needed = true` (uploaded to `public-media`, URL stored in `content_pieces.image_url`)
- An image generation cap applies: `MAX_CAMPAIGN_IMAGES` env var (default 10) prevents runaway OpenAI image costs. Pieces beyond the cap have `image_needed` silently set to false.

**Step 5 — `mark-review`**
Sets campaign `status = 'review'` (or `'failed'` if all pieces failed).

**Step 6 — Queue AI videos**
For pieces with `video_mode = 'generated'`, fires `campaign/video.requested` events to trigger the video pipeline for each piece.

### Posting to Social
From the campaign piece detail page, admin can click "Post to Instagram/Facebook". This calls a Server Action that reads the piece data and calls `postToInstagram()` or `postToFacebook()` from `src/lib/social/meta.ts`. Each function fires a JSON webhook to `SOCIAL_WEBHOOK_URL` (Make.com).

---

## 16. Social Posting via Make.com

**Rule:** The app never calls Instagram, Facebook, or TikTok APIs directly.

All social posting fires a POST to `SOCIAL_WEBHOOK_URL` (a Make.com webhook URL) with:
```json
{
  "platform": "instagram",
  "piece_id": "uuid",
  "content_type": "image_post",
  "caption": "Full caption with hashtags",
  "image_url": "https://...",
  "video_url": null
}
```

Make.com's scenario routes by `platform` to the appropriate native module (Instagram, Facebook, etc.).

**TikTok exception:** TikTok video upload has no Make.com module. TikTok posting is done manually. The `src/lib/social/tiktok.ts` file fires the same webhook format but TikTok posts are fulfilled by the label manually after receiving the webhook data.

---

## 17. Flames Lounge Bar POS

The Flames Lounge is a physical gaming lounge attached to the label. The bar POS runs at `/bar` for bartenders and `/admin/bar/*` for the label admin.

### Key Rules

**Prices are in cents:** All `price_cents` values are JMD × 100 (e.g., $200 JMD = `20000`). The `formatCents()` utility in `src/lib/bar/pos.ts` handles display.

**Jamaica timezone:** Jamaica is UTC-5 year-round (no DST). All "today" queries use `jamaicaMidnight()` from `src/lib/bar/pos.ts`. This function returns the start of the current Jamaica calendar day as a UTC timestamp (05:00 UTC = midnight Jamaica). Never use `new Date().setHours(0,0,0,0)` for bar queries (that gives UTC midnight, not Jamaica midnight).

**Time display:** Use `jamaicaTime()` and `jamaicaDateTime()` from `pos.ts` for all bar timestamps.

### Menu Categories
`drink`, `beverage`, `food`, `snack`, `game_time`. Enforced by a Postgres `CHECK` constraint. Adding a new category requires a migration.

### Tab Flow
1. Bartender opens a new tab at `/bar/tabs/new` (assigns a name/table).
2. Bartender adds items via `/bar/tabs/[id]`. Each add inserts a `pos_tab_items` row.
3. `pos_tabs.total_cents` is maintained by a Postgres function (atomic stock decrement + total update) to prevent race conditions.
4. On close: `status = 'closed'`, payment method recorded, optional tip.

### Bartender Access Control
Two paths to bar access:
1. `profiles.role = 'bartender'` — a standalone bartender account
2. `profiles.is_bartender = true` + `profiles.role = 'artist'` — an artist who also works the bar

Grant via Admin → Bar → Staff → "Promote Existing Artist" (sets `is_bartender = true`).
Revoke via the same page (sets `is_bartender = false`; does not affect artist portal access).

### Shared Bar Utilities (`src/lib/bar/pos.ts`)
All bar pages import from here. Never duplicate:
- `formatCents(cents)` — `$X.XX`
- `jamaicaMidnight(daysAgo?)` — start of Jamaica day as UTC Date
- `jamaicaTime(isoString)` — time in Jamaica timezone
- `jamaicaDateTime(isoString)` — date + time in Jamaica timezone
- `elapsed(startedAt)` — human-readable elapsed time for open tabs
- `CATEGORY_LABELS` — `{ drink: "Drinks", ... }`
- `CATEGORY_ORDER` — canonical category sort order

### Inventory
`pos_items` has `stock_quantity` and `reorder_level`. Stock is decremented atomically when items are added to a tab (RPC in DB prevents race conditions). Admin can view low-stock items.

---

## 18. Gamer Portal

Gamers sign up via `/gamer-signup` (public page). A `gamer_memberships` row is created with an initial balance.

`/gamer` — dashboard showing:
- Membership info (name, member since)
- Current balance
- Recent `gamer_transactions` (credits from top-ups, debits from sessions)

Session history links to `/gamer/sessions`.

---

## 19. Email System

All email goes through **Resend** via `sendEmail()` in `src/lib/email/send.ts`.

```ts
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;  // inline HTML template
  text: string;  // plain-text fallback
}
```

Emails are plain inline HTML with the ink theme (dark background, bone text, ochre CTAs). No template engine — HTML strings are composed at call site.

**Where emails are sent:**
1. A&R application confirmation (to applicant on QR signup submit)
2. Portal invitation (to artist when admin approves their application)
3. Video complete notification (to artist at pipeline end)
4. Application review notifications (approved / rejected)

`RESEND_FROM_EMAIL` sets the "from" address (e.g. `noreply@oneflamerecords.com`). `ADMIN_EMAIL` is used as the reply-to for some outbound messages.

---

## 20. Durable Workflows with Inngest

### Why Inngest
AI video generation takes 8–20 minutes. Vercel serverless functions timeout after 300 seconds (5 minutes on Pro plan). Inngest solves this by breaking work into `step.run()` calls, each of which is a separate serverless invocation. The function can span many invocations totaling hours, with full retry and resume capability.

### How It Works
1. `inngest.send({ name: "video/generate.requested", data: { jobId } })` fires an event.
2. Inngest calls the app's webhook endpoint at `/api/inngest` with the event.
3. The `generateVideo` function runs step by step. Each `step.run()` is a separately retried, separately invoked unit.
4. `step.sleep("id", "3m")` suspends the function for 3 minutes without consuming a serverless invocation.
5. If a step fails, Inngest retries it (up to the `retries` config) before calling `onFailure`.
6. Steps are identified by unique string IDs — must be deterministic (no random IDs). This is what makes replay and resume work: completed steps are replayed from cache; failed/new steps run live.
7. The `cancelOn` config allows in-flight jobs to be cancelled via `video/cancel.requested` event.

### Inngest Functions

| Function | Event | Purpose |
|----------|-------|---------|
| `generate-video` | `video/generate.requested` | Full AI music video pipeline |
| `generate-campaign` | `campaign/generate.requested` | AI content campaign (Claude + OpenAI) |
| `generate-campaign-video` | `campaign/video.requested` | AI video for a campaign piece |
| `regenerate-campaign-piece` | `campaign/piece.regenerate.requested` | Regenerate a single campaign content piece |
| `hello-world` | `test/hello.world` | Test / health check |

### Inngest Dev Server
`npx inngest-cli dev` for local development. The app's `/api/inngest` endpoint must be accessible (via ngrok or Vercel tunnel if needed).

### Environment
- `INNGEST_EVENT_KEY` — used by the app to send events
- `INNGEST_SIGNING_KEY` — used by Inngest to authenticate webhook calls. Must match between Vercel and Inngest dashboard.

---

## 21. Error Tracking — Sentry

Sentry is active in production. Configured via `withSentryConfig()` wrapping `next.config.ts`.

```ts
withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
```

`automaticVercelMonitors: true` — Sentry automatically sets up Vercel cron monitors. Client-side error overlay is active. Server-side exceptions bubble to Sentry.

---

## 22. Deployment — Vercel

- **Hosting:** Vercel. Connected to GitHub `main` branch.
- **Deploy trigger:** Push to `main` → automatic production deploy.
- **Function timeout:** `maxDuration = 300` on the Inngest route handler (`/api/inngest`) — Vercel Pro maximum. Required for the ffmpeg assembly step.
- **External packages:** `music-metadata`, `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg` declared in `serverExternalPackages` in `next.config.ts` to prevent Webpack bundling issues with native/binary dependencies.
- **Server Actions body limit:** 10 MB (`serverActions.bodySizeLimit: "10mb"`) for photo/cover uploads.
- **Image domains:** Supabase Storage public URLs and YouTube thumbnail hosts whitelisted in `images.remotePatterns`.
- **Sentry source maps:** uploaded on CI (`SENTRY_AUTH_TOKEN` env var).

---

## 23. Environment Variables

| Variable | Exposure | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anon key (subject to RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Bypasses RLS. Never expose to client. |
| `NEXT_PUBLIC_SITE_URL` | Client + Server | `https://www.oneflamerecords.com` in prod |
| `RESEND_API_KEY` | Server only | Transactional email |
| `RESEND_FROM_EMAIL` | Server only | From address for outbound email |
| `ADMIN_EMAIL` | Server only | Label admin's email (for notifications) |
| `INNGEST_EVENT_KEY` | Server only | Authenticate event sends to Inngest |
| `INNGEST_SIGNING_KEY` | Server only | Authenticate Inngest webhook calls |
| `ANTHROPIC_API_KEY` | Server only | Claude API for scene generation, campaign copy |
| `OPENAI_API_KEY` | Server only | Whisper transcription + gpt-image-1 image generation |
| `SOCIAL_WEBHOOK_URL` | Server only | Make.com webhook for Instagram/Facebook/TikTok posting |
| `KIE_API_KEY` | Server only | kie.ai video generation (default provider) |
| `DEFAULT_VIDEO_MODEL` | Server only | `'kie'` \| `'kling'` \| `'higgsfield'` \| `'runway'` \| `'pika'` |
| `MAX_CAMPAIGN_IMAGES` | Server only | Max AI images per campaign (default `10`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client + Server | Sentry data source name |
| `SENTRY_ORG` | Build time | Sentry organization slug |
| `SENTRY_PROJECT` | Build time | Sentry project slug |
| `SENTRY_AUTH_TOKEN` | Build time | Sentry source map upload |

---

## 24. Security Model

### What's Protected

**Server-side auth guards on every mutation:**
- Every Server Action that modifies data calls `requireAdmin()` or `requireBarStaff()` as the first line. These throw immediately if the caller isn't authenticated with the required role. This is defense in depth on top of RLS.

**RLS as the database-level last line of defense:**
- Even if application code has a bug, RLS prevents an artist from reading another artist's assets or video jobs.
- The service role key bypasses RLS — it is never importable in client-reachable code (middleware, Client Components, public route handlers).

**Service role key isolation:**
- `createServiceClient()` is only ever called from:
  - Server Actions (after `requireAdmin()`)
  - Inngest functions (server-only, no user context)
  - Layout components that need cross-user reads (admin layouts)
- Never in Client Components, never in `src/proxy.ts`.

**Edge Runtime constraint on proxy:**
- The proxy middleware runs in Edge Runtime, which cannot use `next/headers`. The service client in the proxy is created inline using raw `supabase-js`, not via `createServiceClient()` from `server.ts` (which imports `next/headers`).

**No direct platform API calls:**
- Social media APIs are never called directly from the app. All posting goes through the Make.com webhook. This prevents storing platform OAuth tokens in the app.

**Storage access:**
- `private-assets` bucket has no public access policy. All access is via signed URLs generated server-side. URLs have limited expiry (24h for the pipeline, 1h for portal links).
- `public-media` is publicly readable — appropriate for artist photos, cover art, news images. Nothing sensitive is stored here.

**SQL injection:**
- All database access uses the Supabase client's parameterized query builder. No raw SQL strings with user input are constructed anywhere.

**XSS:**
- React's default JSX escaping prevents XSS in rendered content. News post bodies are Markdown-rendered via `marked` — sanitization should be verified for admin-only content (considered trusted input since only admin writes news).
- `dangerouslySetInnerHTML` is not used in the codebase.

**CSRF:**
- Server Actions in Next.js 15+ include built-in CSRF protection (origin checking). Mutations go through Server Actions, not raw API routes.

**Secret exposure:**
- `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `KIE_API_KEY`, `INNGEST_SIGNING_KEY`, `RESEND_API_KEY`, `SOCIAL_WEBHOOK_URL` are all server-only. None are prefixed with `NEXT_PUBLIC_` and none are imported into Client Components.

### Known Limitations / Tradeoffs
- The `bar_regulars` table uses `USING (false)` RLS policy (service-role only access). This is intentional — customer name data is sensitive and accessed only by staff through the app layer.
- Clip URLs from kie.ai expire in ~24 hours. After expiry, the clip is gone unless the final assembled video was created. This is a kie.ai CDN limitation.
- The assembler runs inside a Vercel serverless function (via Inngest). It downloads files to `/tmp`. The `/tmp` filesystem is ephemeral and limited in size on Vercel (~500 MB). For very long tracks with many clips, this could be a constraint.

---

## 25. Key Conventions & Rules

### Database
- Every schema change is a numbered SQL migration file in `supabase/migrations/`. Never edit an applied migration. Never make schema changes in the Supabase dashboard UI (won't be tracked in git).
- Update `architecture.md` in the same commit as a schema change.

### Commits
Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. One logical change per commit.

### Scrollable Tables
Use `<div className="overflow-x-auto"><table className="w-full min-w-[Npx]">`. Do NOT nest `overflow-hidden` outer + `overflow-x-auto` inner — this breaks touch-scroll on iOS Safari.

### Claude / AI Responses
Always strip markdown code fences before `JSON.parse`. Normalize field names defensively.

### Bar Prices
Always in cents (`price_cents`). Never store decimal dollars. `formatCents(cents)` for display.

### Jamaica Time
Always use `jamaicaMidnight()` for "today" bar queries. Jamaica is UTC-5 year-round. `new Date().setHours(0,0,0,0)` gives UTC midnight, not Jamaica midnight.

### After Server Actions
Use `router.refresh()` to re-fetch server data. Not `window.location.reload()`.

### Video Style Presets
`STYLE_PRESETS` arrays in `AdminVideoRequestForm.tsx` and `VideoRequestForm.tsx` (portal) must always be identical — 16 options.

### Cultural Authenticity in Video Prompts
The Claude system prompt for scene generation describes human subjects through visual specifics (skin tones, hairstyles, dress, settings) rather than racial labels. This is both a cultural requirement from the label and a technical necessity: kie.ai/Kling's content moderation flags explicit racial group designations. The directive must not be removed or weakened.

---

## 26. Complete Data Flow: Video Request End-to-End

Here is the complete sequence of events from admin clicking "Generate video" to the artist watching the finished video.

```
1. ADMIN FILLS FORM (/admin/artists/[id]/videos/new)
   - Selects asset (instrumental)
   - Picks style preset (e.g. "Vintage roots reggae performance")
   - Picks aspect ratio (16:9)
   - Optionally transcribes audio (Whisper API)
   - Optionally clicks "Generate preview" → Claude writes scenes → shows editable textareas
   - Optionally edits scene prompts inline
   - Clicks "Generate video"

2. SERVER ACTION (requestVideoAsAdmin)
   - requireAdmin() → throws if not admin
   - Validates asset belongs to artist
   - Inserts video_jobs row: { status: 'queued', params: { stylePreset, aspectRatio, scenes? } }
   - inngest.send({ name: "video/generate.requested", data: { jobId } })
   - redirect("/admin/jobs")

3. INNGEST RECEIVES EVENT
   - /api/inngest webhook (POST) receives "video/generate.requested"
   - Dispatches to generateVideo() function
   - maxDuration: 300s per invocation, but function spans multiple invocations via steps

4. STEP: load-job
   - Loads job + asset + artist from DB
   - Generates 24h signed URL for source audio
   
5. STEP: mark-analyzing
   - DB: status = 'analyzing', started_at = now()
   
6. PARALLEL STEPS: analyze-audio + transcribe-audio
   - music-metadata extracts BPM, duration, section timestamps
   - OpenAI Whisper transcribes lyrics from audio
   
7. STEP: mark-prompting
   - DB: status = 'prompting'
   
8. CONDITIONAL: write-prompts (skipped if params.scenes exists)
   - Claude (claude-sonnet-4-6) receives: style preset, audio features, lyrics, creative brief
   - Returns JSON array of scenes: [{ start, end, prompt, aspectRatio }, ...]
   - STEP: save-scenes → writes scenes to params.scenes in DB

9. STEP: mark-generating
   - DB: status = 'generating'

10. LOOP: clip batches (5 at a time)
    - PARALLEL STEPS: submit-clip-0, submit-clip-1, ... (skip if params.generatedClips[i] not null)
      - Each calls kie.ai: POST /generations with the scene prompt → returns task_id
    - SLEEP: 3 minutes (single wait for whole batch)
    - LOOP: poll attempts (up to 60 × 30s = 30 min timeout)
      - PARALLEL STEPS: clip-0-poll-{attempt}, clip-1-poll-{attempt}, ...
        - Each calls kie.ai: GET /generations/{task_id} → { done: bool, result: ClipResult? }
      - For each completed clip:
        - STEP: save-clip-{i} → reads current params, updates generatedClips[i], writes back
      - Break when all clips in batch done
      - SLEEP: 30s between attempts
    - Collect batch results into clips[]

11. STEP: mark-assembling
    - DB: status = 'assembling'

12. STEP: assemble
    - Downloads all clip .mp4 files to /tmp
    - Downloads source audio to /tmp
    - Downloads Inter Bold font to /tmp (cached)
    - Runs fluent-ffmpeg:
      - Optional 3s title card (black bg, Oxblood artist name, Bone track title)
      - Each clip: scale to output resolution, trim to scene duration, 24fps
      - Concat all clips
      - Mix source audio full-length
      - Encode: H.264 libx264 -crf 28, AAC 128k
    - Uploads output.mp4 to Supabase Storage: generated-videos/videos/{jobId}.mp4
    - Generates 7-day signed URL
    - Deletes all /tmp files

13. STEP: mark-complete
    - DB: status = 'complete', output_url = signedUrl, completed_at = now(), cost_estimate_usd = sum

14. STEP: notify-artist
    - Looks up artist's auth user email
    - Sends Resend email: "Your One Flame video is ready"
    - Link to /portal/videos

15. ADMIN/ARTIST VIEWS RESULT
    - /admin/jobs auto-refreshes every 30s (JobsAutoRefresh component)
    - /admin/jobs/[id] shows all clips as video players + scene prompts
    - Each clip has ↺ Regenerate button
    - "Watch final video" button links to output_url
    - Artist sees it at /portal/videos/[id]
    - Admin can toggle is_public = true → video appears at /videos (public site)
```

---

*Document generated from the live codebase at commit `ca9dc26`. Last updated: 2026-06-30.*
