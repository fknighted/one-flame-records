# Architecture

Reference document. Update in the same commit as any schema, route, or RLS change.

## Stack rationale

See `decisions.md` for the why. This doc covers the how.

## Data model

All tables use `uuid` primary keys (default `gen_random_uuid()`) and `created_at` / `updated_at` timestamps with a trigger to keep `updated_at` fresh.

### `profiles`
Mirrors `auth.users` with role and link to artist if applicable. One row per user, created via a trigger on `auth.users` insert.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | FK → `auth.users.id` |
| `role` | `text` | `'admin'` or `'artist'` — default `'artist'` |
| `artist_id` | `uuid` nullable | FK → `artists.id`, set after approval |
| `created_at` | `timestamptz` | |

### `artists`
The roster. Public reads, admin writes (except the artist editing their own row).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `slug` | `text` unique | URL-safe stage name |
| `stage_name` | `text` | Display name |
| `legal_name` | `text` nullable | Internal only |
| `bio` | `text` | Markdown allowed |
| `photo_url` | `text` nullable | Supabase Storage public URL |
| `hometown` | `text` nullable | |
| `genres` | `text[]` | e.g. `{reggae, dancehall}` |
| `socials` | `jsonb` | `{instagram, tiktok, twitter, youtube}` |
| `streaming` | `jsonb` | `{spotify_id, apple_id, soundcloud_url}` |
| `status` | `text` | `'pending'`, `'active'`, `'archived'` |
| `featured_order` | `int` nullable | Lower = higher on homepage; null = not featured |

### `releases`
Albums, EPs, singles. Public reads.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `artist_id` | `uuid` | FK → `artists.id` |
| `title` | `text` | |
| `slug` | `text` unique | |
| `type` | `text` | `'single'`, `'ep'`, `'album'`, `'mixtape'` |
| `release_date` | `date` | |
| `cover_url` | `text` | Supabase Storage URL |
| `description` | `text` nullable | |
| `streaming_links` | `jsonb` | `{spotify, apple, youtube, soundcloud, tidal}` |
| `featured` | `boolean` | Default false |

### `videos`
Music videos, lyric videos, behind-the-scenes. Can be YouTube-embedded or a direct upload (`storage_url`). Public reads.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `artist_id` | `uuid` | FK → `artists.id` |
| `release_id` | `uuid` nullable | FK → `releases.id` |
| `title` | `text` | |
| `youtube_id` | `text` nullable | The 11-char YouTube ID. Set manually when linking an existing YouTube video, or automatically after a YouTube upload via the admin panel. |
| `storage_url` | `text` nullable | Public URL of a video file uploaded to Supabase Storage (`public-media/videos/...`). |
| `youtube_upload_status` | `text` nullable | `'uploading'` \| `'done'` \| `'failed'`. Tracks YouTube API upload triggered from `/admin/videos`. |
| `kind` | `text` | `'music_video'`, `'lyric'`, `'live'`, `'behind_scenes'`, `'generated'` |
| `published_at` | `timestamptz` | |
| `featured` | `boolean` | |

### `assets`
Artist uploads — instrumentals, demos, reference clips. Private storage, signed URLs only. Artists see only their own.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `artist_id` | `uuid` | FK → `artists.id` |
| `kind` | `text` | `'instrumental'`, `'demo'`, `'reference_video'`, `'reference_image'` |
| `title` | `text` | |
| `storage_path` | `text` | Path in Supabase Storage |
| `mime_type` | `text` | |
| `size_bytes` | `bigint` | |
| `duration_seconds` | `int` nullable | For audio/video |
| `notes` | `text` nullable | Artist-provided notes |
| `is_public` | `boolean` | Default false. When true, asset appears on the public artist page (admin/artist can toggle). Signed URL generated at render time via service client. |

### `signup_codes`
The QR signup tokens. Admin-only access.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `code` | `text` unique | URL-safe random string |
| `label` | `text` | e.g. "Business card v1" |
| `is_active` | `boolean` | Default true |
| `rotated_at` | `timestamptz` nullable | When superseded |

### `signup_applications`
Submitted via QR scan, awaiting approval.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `code_id` | `uuid` | FK → `signup_codes.id` |
| `stage_name` | `text` | |
| `legal_name` | `text` | |
| `email` | `text` | |
| `phone` | `text` nullable | |
| `genres` | `text[]` | |
| `socials` | `jsonb` | |
| `message` | `text` nullable | Free-text "tell us about yourself" |
| `status` | `text` | `'pending'`, `'approved'`, `'rejected'` |
| `reviewed_by` | `uuid` nullable | FK → `profiles.id` |
| `reviewed_at` | `timestamptz` nullable | |

### `video_jobs`
Phase 4 — state machine for an automated video request.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `artist_id` | `uuid` | FK → `artists.id` |
| `source_asset_id` | `uuid` | FK → `assets.id` (the instrumental) |
| `inngest_run_id` | `text` nullable | For looking up in Inngest dashboard |
| `status` | `text` | `'queued'`, `'analyzing'`, `'prompting'`, `'generating'`, `'assembling'`, `'complete'`, `'failed'` |
| `params` | `jsonb` | `{ stylePreset, aspectRatio, model }` |
| `output_url` | `text` nullable | Final video URL once complete |
| `error` | `text` nullable | If failed |
| `cost_estimate_usd` | `numeric` nullable | Written by pipeline on complete |
| `is_public` | `boolean` | Default false. When true, video appears on public artist page and `/videos` page (admin/artist can toggle). |
| `youtube_id` | `text` nullable | Set after admin uploads the completed video to YouTube via the admin panel. |
| `youtube_upload_status` | `text` nullable | `'uploading'` \| `'done'` \| `'failed'`. Tracks the Inngest `upload-to-youtube` job. |
| `started_at`, `completed_at` | `timestamptz` | |

### `news_posts`
Label news and announcements. Public can read published posts; admin full access.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `slug` | `text` unique | URL-safe identifier |
| `title` | `text` | |
| `excerpt` | `text` nullable | Short summary for cards/listings |
| `body` | `text` | Full post in Markdown |
| `cover_url` | `text` nullable | Supabase Storage public URL (`public-media` bucket, `news/{id}/...`) |
| `category` | `text` | `'label'`, `'release'`, `'event'` — default `'label'` |
| `published_at` | `timestamptz` nullable | When to show publicly |
| `is_published` | `boolean` | Default false. Must be true AND `published_at <= now()` for public access. |
| `created_at`, `updated_at` | `timestamptz` | |

### Bar POS — inventory cost & profit (migration `20260716000001`)

Cost capture added on top of the existing `pos_items` / `pos_tabs` / `pos_tab_items` bar tables so the label can see profit (revenue − cost of goods sold).

- **`pos_items`** new columns:
  - `cost_cents` (`int` nullable) — current unit cost of this sellable SKU (JMD × 100), updated to the latest purchase's per-unit cost. `NULL` = unknown (treated as $0 in profit, so profit is overstated until set).
  - `bottle_group` (`text` nullable) — optional: SKUs sharing a value render together with an output picker. Left NULL for the current rum items (two brands stocked independently; the half-flask pours from either).
  - `bottle_yield` (`int` nullable) — set → the item is stocked **by the bottle**. Holds the *default* units per bottle; the actual yield is editable at add-time (750ml ≈ 16 × 1.5oz shots, 1L ≈ 22). Live defaults: Rum Shot 16, J B Rum Shot 16, Rum - Half Flask 4.
- **`pos_tab_items`** new column `cost_cents` (`int` nullable) — the item's `cost_cents` **snapshotted at time of sale** (mirrors `price_cents`). Profit is locked to sale time: editing an item's cost later never rewrites past profit.
- **`pos_stock_purchases`** — append-only inventory-addition ledger: `pos_item_id`, `quantity_added`, `unit_cost_cents`, `total_cost_cents`, `containers` (bottles, nullable), `container_cost_cents` (nullable), `added_by`, `note`, `created_at`. RLS: select = `is_bar_staff()`; no insert/update/delete policy — all writes go through the service client / RPC (add-only, no remove path).
- **`add_pos_item_stock(p_item_id, p_qty, p_unit_cost_cents)`** — `SECURITY DEFINER` RPC; atomically adds `p_qty` to `stock_quantity` (NULL→0) and sets `cost_cents`. Add-only (rejects non-positive qty). Companion to the existing `decrement_pos_item_stock`.

Permissions: bartenders can only **add** stock (`/bar/inventory`, server-guarded positive-qty, confirmation step); admin retains the absolute "Set" overwrite (`updateStock`) to lower/remove and edits price + cost via the item form. Cost, margin, and profit are **admin-only** — never shown on `/bar`. Profit = `Σ(closed-tab total_cents) − Σ(pos_tab_items.quantity × cost_cents)`; gaming session revenue (`game_sessions.price_jmd`) is a separate stream, excluded from this COGS calc.

## Row-Level Security

RLS is **on** for every table. Default-deny, then grant explicit policies.

### Public read tables
`artists` (where `status = 'active'`), `releases`, `videos` — anyone can `SELECT`. No public `INSERT/UPDATE/DELETE`.

`news_posts` — public can `SELECT` where `is_published = true AND published_at <= now()`.

`assets` — public can `SELECT` where `is_public = true`. Signed URLs are generated server-side at render time via `createServiceClient()` so the underlying `private-assets` bucket stays inaccessible.

`video_jobs` — public can `SELECT` where `is_public = true AND status = 'complete'`.

### Admin-only tables
`signup_codes`, `signup_applications`, `profiles` — only users where `profiles.role = 'admin'` can read or write.

### Artist-scoped tables
`assets`, `video_jobs` — an authenticated artist can only see rows where `artist_id` equals their own `profiles.artist_id`. Admin can see all.

### Artist self-edit on `artists`
An artist can `UPDATE` their own row in `artists` (the one matching `profiles.artist_id`), but only specified columns: `bio`, `photo_url`, `socials`, `streaming`. Admin can update anything.

All policies are defined in numbered SQL migrations in `supabase/migrations/`. Never write a policy in the dashboard UI — it won't be tracked in git.

## Storage buckets

- **`public-media`** — artist photos, release covers, news covers. Public reads. Paths: `photos/{artist_id}/...`, `covers/{release_id}/...`, `news/{post_id}/...`.
- **`private-assets`** — instrumentals, demos, reference clips. No public access. Signed URLs only, **24h expiry when passed into the Inngest pipeline** (pipeline can run 2+ hours); 1h expiry for portal download links. Path: `{artist_id}/{asset_id}.{ext}`.
- **`generated-videos`** — final outputs from the video pipeline. Stored at `videos/{job_id}.mp4`. Signed URLs generated at render time (1h TTL). Admin/artist can mark `is_public` to surface on the public site.

## Routes

App Router structure. Route groups in parentheses don't appear in URLs.

```
src/app/
├── (public)/                          ← cream theme layout
│   ├── page.tsx                       / (hero, artists, releases, videos, news, CTA)
│   ├── artists/
│   │   ├── page.tsx                   /artists
│   │   └── [slug]/page.tsx            /artists/<slug> (Spotify embed, releases, generated videos, photos, music)
│   ├── releases/
│   │   ├── page.tsx                   /releases
│   │   └── [slug]/page.tsx            /releases/<slug> (Spotify album embed)
│   ├── videos/page.tsx                /videos (music videos + generated videos)
│   ├── news/
│   │   ├── page.tsx                   /news (published post cards)
│   │   └── [slug]/page.tsx            /news/<slug> (markdown body via marked)
│   ├── sign/page.tsx                  /sign (A&R intake)
│   ├── about/page.tsx                 /about
│   └── contact/page.tsx               /contact
├── portal/                            ← ink theme, requires artist auth
│   ├── page.tsx                       /portal (dashboard)
│   ├── profile/page.tsx               /portal/profile
│   ├── assets/page.tsx                /portal/assets (public/private toggle)
│   ├── assets/new/page.tsx            /portal/assets/new
│   └── videos/
│       ├── page.tsx                   /portal/videos (job library, public/private toggle)
│       ├── [job_id]/page.tsx          /portal/videos/<id> (detail, pipeline progress)
│       └── new/page.tsx               /portal/videos/new
├── admin/                             ← ink theme, requires admin auth
│   ├── layout.tsx
│   ├── page.tsx                       /admin (overview)
│   ├── artists/
│   │   ├── page.tsx                   /admin/artists
│   │   ├── [id]/edit/page.tsx         /admin/artists/<id>/edit
│   │   ├── [id]/assets/page.tsx       /admin/artists/<id>/assets (upload, public/private toggle)
│   │   └── [id]/videos/page.tsx       /admin/artists/<id>/videos (generated jobs, public/private toggle)
│   ├── releases/                      /admin/releases (CRUD)
│   ├── videos/                        /admin/videos (CRUD — YouTube videos)
│   ├── news/
│   │   ├── page.tsx                   /admin/news (post list)
│   │   ├── new/page.tsx               /admin/news/new
│   │   └── [id]/edit/page.tsx         /admin/news/<id>/edit
│   ├── applications/                  /admin/applications (review pending)
│   ├── codes/                         /admin/codes (manage QR codes)
│   ├── jobs/                          /admin/jobs (video pipeline observability)
│   └── settings/
│       ├── page.tsx                   /admin/settings (monthly budget, MFA)
│       └── brand/page.tsx             /admin/settings/brand (intro/outro clip upload)
├── signup/[code]/page.tsx             /signup/<code> (QR landing)
├── login/page.tsx                     /login (shared admin + artist)
└── api/
    ├── inngest/route.ts               Inngest webhook
    └── ...
```

## Auth flow

Single Supabase Auth instance handles both admin and artist roles. After login, the user is redirected based on `profiles.role`: admins to `/admin`, artists to `/portal`.

Middleware (`src/middleware.ts`) protects `/admin/*` and `/portal/*`. Unauthenticated → redirect to `/login` with the original destination as `?next=`. Wrong role → redirect to the appropriate dashboard.

## Environment variables

See `.env.example`. Phase notes:

| Variable | Phase | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 1 | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 1 | Safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | 1 | **Server-only.** Used for admin actions and Inngest functions. Never import into a Client Component. |
| `RESEND_API_KEY` | 3 | |
| `RESEND_FROM_EMAIL` | 3 | e.g. `noreply@oneflamerecords.com` |
| `INNGEST_EVENT_KEY` | 4 | |
| `INNGEST_SIGNING_KEY` | 4 | |
| `KLING_API_KEY` | 4 | First video model integration |
| `NEXT_PUBLIC_SITE_URL` | 1 | `https://oneflamerecords.com` in prod, `http://localhost:3000` local |
