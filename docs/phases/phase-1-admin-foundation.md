# Phase 1 — Admin foundation

**Goal:** A working Next.js + Supabase app deployed to oneflamerecords.com with an admin dashboard where fk can enter the five existing artists, their bios, photos, releases, and YouTube videos. No public site styling yet, no portal, no video pipeline. Just the data spine and a place to type into it.

**Estimated time:** 2 working days.

**Done when:** All five real artists are entered with bios, photos, at least one release each, and any existing videos linked. The data is live in Supabase and rendered by a working admin UI at oneflamerecords.com/admin.

---

## Task 1 — Initialize the Next.js app

**Do:**
- `npx create-next-app@latest oneflame-records` with App Router, TypeScript, Tailwind, ESLint, `src/` directory, `@/` alias.
- Update `tailwind.config.ts` with the color tokens from `docs/brand.md`.
- Add `next/font` setup with body and display fonts (start with Fraunces + Inter — free, on Google Fonts).
- Replace the default home page with a minimal "One Flame Records — coming soon" placeholder using brand colors.
- Initialize git, first commit, push to a new GitHub repo.

**Acceptance:**
- `npm run dev` shows the placeholder with cream background and oxblood headline.
- `npm run typecheck` and `npm run lint` pass.
- Repo is on GitHub.

---

## Task 2 — Connect Supabase

**Do:**
- Create a Supabase project (region closest to Jamaica — `us-east-1`).
- Install the Supabase CLI. `npx supabase init` → `npx supabase link --project-ref <ref>`.
- Install `@supabase/supabase-js` and `@supabase/ssr`.
- Create `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/middleware.ts` following the official Next.js App Router pattern.
- Add env vars to `.env.local` and `.env.example`.
- Start local Supabase: `npx supabase start`.

**Acceptance:**
- A Server Component can query Supabase and render the result.
- Both local and remote Supabase URLs work via env switching.
- `.env.local` is gitignored; `.env.example` has placeholder values committed.

---

## Task 3 — Initial schema migration

**Do:**
- `npx supabase migration new initial_schema`.
- Write SQL to create `profiles`, `artists`, `releases`, `videos`, `assets`, `signup_codes`, `signup_applications`, `video_jobs` as specified in `docs/architecture.md`.
- Add `updated_at` triggers.
- Add the `auth.users` insert trigger that creates a matching `profiles` row.
- Apply locally: `npx supabase db push`.
- Generate types: `npx supabase gen types typescript --local > src/types/supabase.ts`.

**Acceptance:**
- All eight tables exist locally with the columns specified in `docs/architecture.md`.
- TypeScript types are generated and committed.
- A test insert + select via the server client works.

---

## Task 4 — Row-Level Security policies

**Do:**
- New migration: `add_rls_policies`.
- Enable RLS on every table.
- Write policies per `docs/architecture.md` § Row-Level Security.
- Test each policy with `set role` in psql to verify default-deny is working.

**Acceptance:**
- Anonymous reads work for `artists` (active only), `releases`, `videos`.
- Anonymous reads of `assets`, `signup_applications`, `signup_codes`, `profiles` are blocked.
- An authenticated artist can see only their own `assets` rows.

---

## Task 5 — Auth & login page

**Do:**
- Build `/login` — email + password form. Tailwind styling, cream theme.
- Server Action that calls `supabase.auth.signInWithPassword`.
- After successful login, look up `profiles.role` and redirect: admin → `/admin`, artist → `/portal` (which doesn't exist yet — fine, will 404 for Phase 1).
- Middleware (`src/middleware.ts`) that protects `/admin/*`: if not logged in or not admin, redirect to `/login?next=<path>`.
- Manually create the first admin user in Supabase dashboard, then set their `profiles.role = 'admin'` via SQL.

**Acceptance:**
- Going to `/admin` while logged out redirects to `/login`.
- Logging in as admin lands on `/admin`.
- Logging out (via a logout button) clears the session.

---

## Task 6 — Admin layout

**Do:**
- `src/app/admin/layout.tsx` — ink theme, sidebar nav with links to: Overview, Artists, Releases, Videos, Applications, Codes, Jobs.
- Top bar with the One Flame mark (ink variant), logged-in user email, logout button.
- An empty `/admin/page.tsx` with placeholder stats (artist count, release count) pulled live from Supabase.

**Acceptance:**
- The admin shell renders with the ink theme and the brand mark.
- Stats reflect actual database counts.
- Sidebar links don't 404 — they go to empty placeholder pages with section headers.

---

## Task 7 — Artists CRUD

**Do:**
- `/admin/artists` — list view with stage name, status, hometown, featured order, edit button. Sortable by featured_order.
- `/admin/artists/new` — form for all fields in `docs/architecture.md` § artists. Slug auto-generates from stage_name but is editable.
- `/admin/artists/[id]/edit` — same form, pre-filled.
- Photo upload to `public-media` bucket, path `photos/{artist_id}/{uuid}.{ext}`. Show preview.
- All mutations via Server Actions.

**Acceptance:**
- Can create an artist with a photo and see them in the list.
- Can edit and the changes persist.
- Photo is publicly accessible via its URL.
- All form validation works (required fields, slug uniqueness).

---

## Task 8 — Releases CRUD

**Do:**
- `/admin/releases` — list view, sortable by release_date desc.
- `/admin/releases/new` and `/admin/releases/[id]/edit` — full form per `docs/architecture.md` § releases.
- Artist picker is a select populated from active artists.
- Cover upload to `public-media`, path `releases/{release_id}/cover.{ext}`.
- Streaming links: structured input with one row per platform.

**Acceptance:**
- Can create a release tied to an artist with a cover image.
- Can list, edit, and delete (soft delete via a `deleted_at` column if we want, otherwise hard delete — Phase 1 choice).
- Streaming links round-trip cleanly as JSONB.

---

## Task 9 — Videos CRUD

**Do:**
- `/admin/videos` — list view with thumbnail, title, artist, kind, featured.
- `/admin/videos/new` and `/admin/videos/[id]/edit`.
- Paste a YouTube URL → server extracts the 11-char ID and validates it via the oEmbed endpoint.
- Optionally link to a release.

**Acceptance:**
- Can create a video by pasting a YouTube URL.
- The list shows the real YouTube thumbnail.
- Editing and deleting work.

---

## Task 10 — Deploy to Vercel and connect domain

**Do:**
- Import the GitHub repo into Vercel.
- Set production environment variables (Supabase URL, anon key, service role key, site URL).
- Trigger first deploy.
- In the domain registrar, point oneflamerecords.com to Vercel (follow Vercel's DNS instructions — usually A record or CNAME).
- Add both `oneflamerecords.com` and `www.oneflamerecords.com` in Vercel project settings, with `www` redirecting to the apex.
- Verify HTTPS is live.

**Acceptance:**
- `https://oneflamerecords.com` loads the placeholder.
- `https://oneflamerecords.com/admin` redirects to login.
- Logging in with the production admin user works.

---

## Task 11 — Enter the real data

**Do:**
- For each of the five existing artists: enter stage name, bio (write or paste), photo, hometown, genres, socials, streaming links. Set status to `active`.
- For each artist, enter at least one release.
- For each artist with existing videos on YouTube, add those.
- Set `featured_order` on the two or three artists who should headline the homepage.

**Acceptance:**
- `select count(*) from artists where status = 'active'` returns 5.
- All five have photos visible.
- Featured ordering is set.

---

## Phase 1 wrap-up

Before declaring Phase 1 done:

- Update `PROGRESS.md` — mark Phase 1 complete, set Phase 2 as next.
- If anything non-obvious got decided along the way, append to `DECISIONS.md`.
- Tag the commit: `git tag phase-1-complete && git push --tags`.

Now we have the data. Phase 2 wraps it in a public site.
