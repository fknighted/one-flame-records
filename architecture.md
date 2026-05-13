# Architecture

Reference document. Update in the same commit as any schema, route, or RLS change.

## Stack rationale

See `DECISIONS.md` for the why. This doc covers the how.

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
Music videos, lyric videos, behind-the-scenes. YouTube-embedded only. Public reads.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `artist_id` | `uuid` | FK → `artists.id` |
| `release_id` | `uuid` nullable | FK → `releases.id` |
| `title` | `text` | |
| `youtube_id` | `text` | The 11-char YouTube ID |
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
| `params` | `jsonb` | Style, mood, target duration, model preference |
| `output_url` | `text` nullable | Final video URL once complete |
| `error` | `text` nullable | If failed |
| `started_at`, `completed_at` | `timestamptz` | |

## Row-Level Security

RLS is **on** for every table. Default-deny, then grant explicit policies.

### Public read tables
`artists` (where `status = 'active'`), `releases`, `videos` — anyone can `SELECT`. No public `INSERT/UPDATE/DELETE`.

### Admin-only tables
`signup_codes`, `signup_applications`, `profiles` — only users where `profiles.role = 'admin'` can read or write.

### Artist-scoped tables
`assets`, `video_jobs` — an authenticated artist can only see rows where `artist_id` equals their own `profiles.artist_id`. Admin can see all.

### Artist self-edit on `artists`
An artist can `UPDATE` their own row in `artists` (the one matching `profiles.artist_id`), but only specified columns: `bio`, `photo_url`, `socials`, `streaming`. Admin can update anything.

All policies are defined in numbered SQL migrations in `supabase/migrations/`. Never write a policy in the dashboard UI — it won't be tracked in git.

## Storage buckets

- **`public-media`** — artist photos, release covers, generated video thumbnails. Public reads. Admin writes; artists can write to their own `photos/{artist_id}/...` path.
- **`private-assets`** — instrumentals, demos, reference clips. No public access. Signed URLs only, 60-minute expiry. Path: `{artist_id}/{asset_id}.{ext}`.
- **`generated-videos`** — final outputs from the video pipeline. Public reads (so they can be embedded), admin writes via service role from Inngest function.

## Routes

App Router structure. Route groups in parentheses don't appear in URLs.

```
src/app/
├── (public)/                          ← cream theme layout
│   ├── page.tsx                       /
│   ├── artists/
│   │   ├── page.tsx                   /artists
│   │   └── [slug]/page.tsx            /artists/<slug>
│   ├── releases/
│   │   ├── page.tsx                   /releases
│   │   └── [slug]/page.tsx            /releases/<slug>
│   ├── videos/page.tsx                /videos
│   ├── about/page.tsx                 /about
│   └── contact/page.tsx               /contact
├── (portal)/                          ← ink theme layout, requires artist auth
│   └── portal/
│       ├── page.tsx                   /portal (dashboard)
│       ├── profile/page.tsx           /portal/profile
│       ├── assets/page.tsx            /portal/assets
│       ├── assets/new/page.tsx        /portal/assets/new
│       └── videos/
│           ├── page.tsx               /portal/videos
│           └── new/page.tsx           /portal/videos/new
├── admin/                             ← ink theme, requires admin auth
│   ├── layout.tsx
│   ├── page.tsx                       /admin (overview)
│   ├── artists/                       /admin/artists ...
│   ├── releases/
│   ├── videos/
│   ├── applications/                  /admin/applications (review pending)
│   ├── codes/                         /admin/codes (manage QR codes)
│   └── jobs/                          /admin/jobs (video pipeline observability)
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
