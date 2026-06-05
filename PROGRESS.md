# Progress

This is the living state of the build. Update at the end of every session.

---

## Current state

- **Phase:** 4 — Video automation (pipeline live and tested end-to-end)
- **Status:** Full pipeline running in production via kie.ai. Generated videos appear in portal and public site. Music video upload (direct-to-Supabase presigned URL) live in admin. Beat-aligned cuts and opening title card added to assembly. Phase 4 is functionally complete — cleanup items remain.
- **Last updated:** 2026-06-04

## Active focus

Phase 4 cleanup + polish, then Phase 5 planning.

## Blockers

None blocking. Known cleanup items:
- Admin videos list shows broken thumbnail for uploaded (non-YouTube) videos — needs fallback
- Admin videos list shows raw `youtube_id` beneath title; should show "Uploaded" for storage_url videos

## Next session

### Priority 1 — Admin videos list polish
Fix thumbnail and subtitle display for uploaded videos (no youtube_id) in `/admin/videos`.

### Priority 2 — News posts
Create first real news post via `/admin/news/new` to verify admin CRUD and public `/news` page end-to-end.

### Priority 3 — Phase 4 sign-off + Phase 5 planning
Review what's complete, mark Phase 4 done, scope Phase 5.

## Phase progress

- [x] **Phase 1** — Admin foundation _(complete)_
- [x] **Phase 2** — Public site _(complete)_
- [x] **Phase 3** — QR onboarding + artist portal _(complete)_
- [ ] **Phase 4** — Video automation

---

## Session log

Append a new entry at the top of this section after every session. Date, summary, files touched, what's next. Keep it tight — full reasoning belongs in `DECISIONS.md`.

### 2026-06-04 (session 21)

**Did:** Major pipeline and UI session. (1) kie.ai endpoint bugs fixed — correct path `/api/v1/jobs/createTask`, body wrapped in `input` object, `task_id`/`resultJson.resultUrls[0]` response fields. (2) `updateJobStatus` now throws on Supabase error so Inngest surfaces failures instead of silently completing. (3) Retry resilience — each generated clip saved to `video_jobs.params.generatedClips[i]`; retries skip already-done clips. (4) Reset button for stuck jobs — marks active-state jobs as failed so Retry becomes available. (5) Beat-aligned scene cuts — `buildSections` snaps to 4-beat multiples of BPM; ffmpeg `trim+setpts` per clip. (6) Opening title card — artist name (oxblood, 72pt) + track title (bone, 40pt) prepended via ffmpeg lavfi + drawtext; Inter Bold downloaded to /tmp. (7) Admin jobs UX — Cost column, Duration renamed to Process time, falsy-zero cost fix in portal detail. (8) Logos enlarged — square logo.png (w-36) added to desktop sidebar above nav; header logo bumped to h-14/h-20. (9) Video file upload — presigned URL flow (browser → Supabase direct), source toggle in VideoForm, VideoEmbed handles storage_url with native `<video controls>`. Bug fixes: kind constraint values aligned, VideoEmbed controls fix (removed object-cover).
**Touched:** `src/lib/video/providers/kie.ts`, `src/lib/inngest/functions/generate-video.ts`, `src/app/admin/jobs/actions.ts`, `src/app/admin/jobs/page.tsx`, `src/components/RetryButton.tsx`, `src/components/JobsAutoRefresh.tsx`, `src/components/ArtistPickerDropdown.tsx`, `src/lib/audio/analyze.ts`, `src/lib/video/assemble.ts`, `src/components/InkShell.tsx`, `src/components/VideoForm.tsx`, `src/components/VideoEmbed.tsx`, `src/app/admin/videos/actions.ts`, `src/app/(public)/videos/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/releases/[slug]/page.tsx`, `src/app/(public)/artists/[slug]/page.tsx`, `supabase/migrations/20260604000000_videos_storage_url.sql`, `src/app/icon.png` (favicon)
**Decided:** kie.ai over Higgsfield (image-to-video only, incompatible pipeline). Presigned upload URL pattern for video files (no large body through Vercel). Beat-grid section alignment via BPM metadata.
**Blocked on:** Nothing critical.
**Next:** Admin videos list thumbnail fallback for uploaded videos. News post test. Phase 4 sign-off.

### 2026-06-01 (session 20)

**Did:** Three improvements. (1) kie.ai video provider — `src/lib/video/providers/kie.ts` implements `ClipGenerator` against kie.ai's unified API (Kling 2.1 Standard, ~$0.125/5s vs $0.14 direct); plain Bearer token auth replaces hand-rolled JWT; `DEFAULT_VIDEO_MODEL=kie` in `.env.example`; all prod keys confirmed in Vercel. (2) Admin jobs UX — auto-refresh every 30s while jobs active (`JobsAutoRefresh`), one-click ↺ Retry on failed jobs (`RetryButton` + `retryJob` action clones job + re-fires Inngest), "+ Request video" artist picker dropdown in header (`ArtistPickerDropdown`), cost estimate updated to kie.ai pricing. (3) Flame-only favicon — cropped flame mark from `public/logo.png` using sharp (512×512 transparent PNG), saved as `src/app/icon.png`, removed old `favicon.ico`.
**Touched:** `src/lib/video/providers/kie.ts` (new), `src/lib/video/index.ts`, `.env.example`, `src/app/admin/jobs/actions.ts`, `src/app/admin/jobs/page.tsx`, `src/components/JobsAutoRefresh.tsx` (new), `src/components/RetryButton.tsx` (new), `src/components/ArtistPickerDropdown.tsx` (new), `src/components/AdminVideoRequestForm.tsx`, `src/app/icon.png`, `src/app/favicon.ico` (deleted)
**Decided:** kie.ai over Higgsfield — Higgsfield is image-to-video only and incompatible with pipeline's submit/check pattern. kie.ai uses identical async API, simpler auth, and proxies multiple models.
**Blocked on:** E2E pipeline test.
**Next:** E2E test → Phase 4 complete.

### 2026-05-27 (session 19 cont.)

**Did:** Admin artist generated-videos list. Created `src/app/admin/artists/[id]/videos/page.tsx` — shows all `video_jobs` for an artist with style preset, status (color-coded pill), dates, and a Public/Private toggle on complete jobs. `toggleJobPublic` server action in co-located `actions.ts` uses service client (admin, no ownership check needed). Added "Videos →" link to artist edit page header alongside "Assets →". Added "Generated Videos →" crosslink to assets page.
**Touched:** `src/app/admin/artists/[id]/videos/page.tsx` (new), `src/app/admin/artists/[id]/videos/actions.ts` (new), `src/app/admin/artists/[id]/edit/page.tsx`, `src/app/admin/artists/[id]/assets/page.tsx`
**Decided:** Nothing new.

### 2026-05-27 (session 19)

**Did:** "Public site richness" pass. (1) Spotify embeds — `src/lib/spotify.ts` `buildSpotifyEmbedUrl()` helper; album embed (352px) added to release detail page below description; compact artist embed (152px) added to artist page sidebar. (2) News/blog — `news_posts` Supabase table + RLS migration applied; admin CRUD at `/admin/news` (list, new, edit/delete); public pages `/news` (card grid) and `/news/[slug]` (markdown body via `marked`); "News" added to both PublicHeader and admin nav. (3) Generated videos — public `/videos` page now shows a "Generated Videos" section alongside music videos (signed URLs via service client). (4) Homepage — "Latest News" card row added (3 most-recent published posts). (5) Previously: public asset visibility toggles on admin + portal (is_public flag), Generated Videos / Photos / Music sections on artist detail page, transcript + scene-plan preview in admin video form, 24h signed URLs for pipeline audio, restructured Inngest polling (5-min initial sleep + 50×30s).
**Touched:** `src/lib/spotify.ts` (new), `src/app/(public)/releases/[slug]/page.tsx`, `src/app/(public)/artists/[slug]/page.tsx`, `src/app/(public)/videos/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/news/page.tsx` (new), `src/app/(public)/news/[slug]/page.tsx` (new), `src/app/admin/news/` (all new), `src/components/NewsForm.tsx` (new), `src/components/PublicHeader.tsx`, `src/app/admin/layout.tsx`, `supabase/migrations/20260527000001_news_posts.sql` (new, applied), `src/types/supabase.ts`
**Decided:** Used `marked` v18 for markdown → HTML. Chose `set_updated_at()` (not `handle_updated_at`) for news_posts trigger — consistent with initial schema.

### 2026-05-20 (session 18 cont. 3)

**Did:** Bug fixes + production polish. (1) Fixed portal video detail page `formatParams` — it was reading `p.style`, `p.mood`, `p.aspect_ratio` (design mockup keys) but `requestVideo` stores `stylePreset`, `aspectRatio`, `model`. Settings panel now shows "Visual style", "Format", "Model" correctly. (2) Removed hardcoded "Reviewer: Carlton" from video detail settings panel. (3) Fixed Inngest run URL in portal video detail — now uses localhost:8288 in dev and `app.inngest.com` in production. (4) Custom 404 page `src/app/not-found.tsx` — ink background, flame glyph, "Page not found." in display font, "Go home" + "Releases" CTAs.
**Touched:** `src/app/portal/videos/[job_id]/page.tsx`, `src/app/not-found.tsx` (new)
**Decided:** Nothing new.
**Blocked on:** End-to-end video pipeline test.
**Next:** E2E test is the last remaining build item before Phase 4 is complete.

### 2026-05-20 (session 18 cont. 2)

**Did:** Design consistency pass on the last two public catalog pages. `/artists` list — ink banner header with roster count and eyebrow, artist grid moved to cream section below. `/videos` — ink banner header, sticky cream filter bar (same pattern as `/releases`), clear-filters link on empty state. All public catalog pages (artists, releases, videos) now follow the same ink-banner + cream-grid structure.
**Touched:** `src/app/(public)/artists/page.tsx`, `src/app/(public)/videos/page.tsx`
**Decided:** No new decisions — pattern established by /releases redesign applied uniformly.
**Blocked on:** End-to-end video pipeline test.
**Next:** E2E test. Public site design is now fully consistent — all catalog pages match.

### 2026-05-20 (session 18 cont.)

**Did:** Two more pages. (1) Portal dashboard refresh — removed "coming in Phase 4" placeholder, all three action tiles now active (Upload / Request Video / Edit Profile with icons), 2-stat counter row (assets, video jobs — both live counts from Supabase), recent video jobs table with status pills (same colors as the jobs library), recent assets table, both tables have "View all →" links to the respective portal sections. (2) Release detail page redesign — ink header band with back arrow, cover thumbnail + title block (pill, title, artist link, date); cream body with description + video embed in left column, streaming service buttons in right sidebar; JSON-LD preserved; streaming services icons resized to 18px for tighter buttons.
**Touched:** `src/app/portal/page.tsx`, `src/app/(public)/releases/[slug]/page.tsx`
**Decided:** Nothing new — follows existing ink/cream split pattern.
**Blocked on:** End-to-end video pipeline test.
**Next:** E2E test.

### 2026-05-20 (session 18)

**Did:** Three deliverables. (1) Homepage hero image — DJI performance shot (outdoor Montego Bay venue, string lights, drums, audience) resized to 1920px, copied to `public/hero-bg.jpg`; homepage hero section now uses `next/image` with `fill` + `object-cover`, ink dark overlay at 72% opacity, oxblood radial glow on top. (2) `/sign` A&R intake page — new public page at `src/app/(public)/sign/page.tsx`; ink hero with "We're looking for artists who have something real to say" headline + CTAs; cream "What we look for" section with genre list and editorial copy; ink "How it works" 3-step process; oxblood final CTA. "Sign with us" added to public header (outlined oxblood button) and footer (Label section). (3) Public `/releases` redesign — ink banner header section with live catalog count; sticky cream filter bar; sort chips (Newest / Oldest / A–Z) added to `ReleasesFilter`; clear-filters link on empty state.
**Touched:** `src/app/(public)/page.tsx`, `public/hero-bg.jpg` (new), `src/app/(public)/sign/page.tsx` (new), `src/components/PublicHeader.tsx`, `src/components/PublicFooter.tsx`, `src/app/(public)/releases/page.tsx`, `src/components/ReleasesFilter.tsx`
**Decided:** DJI night performance photo used for hero (abstract vinyl/flag image not yet available). Sorting done client-side in the server component after fetching (not a DB ORDER BY) — keeps the filter logic in one place and the catalog is small enough that this is fine.
**Blocked on:** End-to-end video pipeline test (still never run with a real file).
**Next:** E2E test → portal dashboard refresh → release detail page editorial treatment.

### 2026-05-20 (session 17)

**Did:** Two features. (1) Admin asset upload — new route `/admin/artists/[id]/assets` where admin can upload MP3s, demos, reference videos/images on behalf of any artist. `uploadAssetForArtist` server action uses `createServiceClient()` for both storage and DB (bypasses RLS), accepts explicit `artistId`. `deleteAsset` removes from `private-assets` storage and `assets` table. `AdminAssetUploadForm` client component uses `.bind()` to curry `artistId` into the `useActionState` action, shows a dismissible success banner without redirecting so admin can upload multiple files. "Assets" link added to admin artists list and artist edit page header. (2) Mobile responsiveness — `InkShell` client component replaces the inline shell in both admin and portal layouts; handles hamburger nav, slide-in sidebar overlay with backdrop, `usePathname`-based active link highlighting, responsive header height and padding. Portal releases + videos pages now render a compact mobile card per row (cover/title/status pill stacked) on `< sm` and the existing multi-column grid on `≥ sm`. Status tile strip on releases scrolls horizontally on mobile. Admin assets table wrapped in `overflow-x-auto`. Filter chips get `flex-wrap` so they reflow instead of overflow. Typecheck clean. All committed and pushed.
**Touched:** `src/app/admin/artists/[id]/assets/actions.ts` (new), `src/app/admin/artists/[id]/assets/page.tsx` (new), `src/components/AdminAssetUploadForm.tsx` (new), `src/app/admin/artists/page.tsx`, `src/app/admin/artists/[id]/edit/page.tsx`, `src/components/InkShell.tsx` (new), `src/app/admin/layout.tsx`, `src/app/portal/layout.tsx`, `src/app/portal/releases/page.tsx`, `src/app/portal/videos/page.tsx`, `src/components/ReleasesManagerFilter.tsx`, `src/components/VideoLibraryFilter.tsx`
**Decided:** Admin asset upload uses service client for DB insert (not session client) — artists' RLS restricts `assets` inserts to their own `artist_id`, so admin cannot write on their behalf through the session client. Logged implicitly; no new DECISIONS.md entry needed (follows existing pattern). `InkShell` is a single shared component for both admin and portal shells — avoids duplicating hamburger logic. Active-link logic uses path depth to distinguish root items (exact match) from deeper items (prefix match).
**Blocked on:** End-to-end video pipeline test (never run with a real file). Homepage hero image.
**Next:** End-to-end test → homepage hero → deferred design handoff pages.

### 2026-05-19 (session 16)

**Did:** Design handoff session. Imported `design_handoff_one_flame_pages/` bundle. Scope agreed with user: (1) New `/portal/releases` Roster Table — status tile strip (7 statuses), format filter chips, sortable column table, streaming icon links, admin sees all releases + Artist column via service client, artist sees own via RLS. `ReleasesManagerFilter` client component (URL-based chips). (2) Redesigned `/portal/videos` Job Library — hero "Start a job" card with oxblood/ochre gradient + radial glow, 4 video-type SVG buttons linking to `/portal/videos/new?type=X`, `VideoLibraryFilter` client component, 6-column job row grid with 3-state status pills (Done/Rendering/Failed) from CSS tokens. (3) New `/portal/videos/[job_id]` detail — breadcrumb, status-colored header, 16:9 preview surface, 6-step pipeline progress bar, source asset panel, settings panel (from `job.params` jsonb), timeline with timestamps and cost estimate. DB migration: `catalog_no text` + `production_status text DEFAULT 'live'` on releases table. Types regenerated. JetBrains Mono added to layout, status color tokens added to globals.css. Portal nav updated: Dashboard → Releases → Assets → Videos → Profile.
**Touched:** `src/app/layout.tsx`, `src/app/globals.css`, `src/app/portal/layout.tsx`, `src/app/portal/releases/page.tsx` (new), `src/components/ReleasesManagerFilter.tsx` (new), `src/app/portal/videos/page.tsx` (full replacement), `src/components/VideoLibraryFilter.tsx` (new), `src/app/portal/videos/[job_id]/page.tsx` (new), `supabase/migrations/20260519000000_releases_catalog_status.sql` (new), `src/types/supabase.ts`
**Decided:** `production_status` column name (not `status`) to avoid ambiguity with `artists.status`. Video jobs display asset title where spec showed release title — schema is asset-based, not release-based. Skip `/portal/royalties` (no data), skip artist detail / about / public releases redesign (deferred).
**Blocked on:** `generated-videos` bucket (confirmed created by user), Homepage hero image.
**Next:** Admin asset upload (completed session 17). Then end-to-end video test.

### 2026-05-19 (session 15)

**Did:** Phase 4 Tasks 7–9 + full visual redesign. Task 7 — `/portal/videos/new`: `VideoRequestForm` client component (style presets, aspect ratio radio, asset selector), `requestVideo` server action with month-to-date budget check (`settings` table, `PER_JOB_ESTIMATE_USD = 5`; admin bypasses limit), fires Inngest event on success. Task 8 — `/portal/videos` job list: color-coded status badges, Watch link on complete, error text on failed. `/admin/jobs` stats row + full table with artist name, asset, status, duration, Watch + Inngest Logs links. Task 9 — cost limiter: `20260514000000_cost_limiter.sql` migration (`settings` table + `cost_estimate_usd` column on `video_jobs`); `/admin/settings` spend meter with color-coded progress bar; `BudgetForm` client component. Inngest `mark-complete` step now writes `cost_estimate_usd`. Visual redesign: dark/cinematic homepage hero (ink bg, radial oxblood glow, `clamp` headline); artist cards with full gradient overlay + name pinned inside frame; section rhythm (Hero→Artists→Releases→Videos→CTA alternating ink/cream/oxblood); ink footer with oxblood top border. Real logo integrated: logo-2 in public header (h-20), logo-4 in admin/portal sidebars (h-14), original square in footer (h-40), logo-4 in OG image. Mobile menu: `z-[60]` + inline hex `#1A1612` (bypasses Tailwind token resolution issue with backdrop-blur stacking context). Admin overview: "View public site" link with arrow icon.
**Touched:** `src/app/portal/videos/new/page.tsx`, `src/app/portal/videos/new/actions.ts`, `src/components/VideoRequestForm.tsx`, `src/app/portal/videos/page.tsx`, `src/app/admin/jobs/page.tsx`, `src/app/admin/settings/page.tsx`, `src/app/admin/settings/BudgetForm.tsx`, `src/app/admin/settings/actions.ts`, `src/app/admin/layout.tsx`, `src/app/portal/layout.tsx`, `src/lib/inngest/functions/generate-video.ts`, `supabase/migrations/20260514000000_cost_limiter.sql`, `src/types/supabase.ts`, `src/app/(public)/page.tsx`, `src/components/ArtistCard.tsx`, `src/components/SectionHeader.tsx`, `src/components/PublicHeader.tsx`, `src/components/PublicFooter.tsx`, `src/app/admin/page.tsx`, `src/app/opengraph-image.tsx`, `public/logo-1.png` through `public/logo-4.png`
**Decided:** Mobile menu requires inline `style` hex (not Tailwind token) because `backdrop-blur` on the header creates a stacking context that breaks CSS variable resolution for sibling/child elements. Inline hex bypasses this cleanly. Logged in DECISIONS.md.
**Blocked on:** `generated-videos` Supabase bucket (SQL one-liner, needs manual creation). Homepage hero image (user generating abstract vinyl/flag motif — once dropped in, wire as hero background).
**Next:** Create `generated-videos` bucket → end-to-end video pipeline test → homepage hero image → artist/release detail pages.

### 2026-05-14 (session 14)

**Did:** Phase 4 Tasks 3–6. Task 3 — `src/lib/audio/analyze.ts`: `analyzeAudio` uses `music-metadata` to parse audio from a signed URL; extracts duration + BPM (falls back to 90); divides track into 4 equal sections (low→mid→high→mid energy). Task 4 — `src/lib/video/prompt-scenes.ts`: calls `claude-opus-4-7` with `generate_scenes` tool use; system prompt establishes Jamaican roots/dancehall visual aesthetic; Zod-validates output; retries once on validation failure. Task 5 — `src/lib/video/assemble.ts`: downloads clips + audio to `/tmp`, runs `fluent-ffmpeg` with xfade crossfades between clips (0.5s), uploads MP4 to `generated-videos` Supabase Storage, returns 7-day signed URL, cleans up temp files. Task 6 — `src/lib/inngest/functions/generate-video.ts`: 11-step durable Inngest pipeline (load job → analyze → prompt → generate clips in parallel → assemble → mark complete → notify artist via email). Registered in API route. `next.config.ts` updated with `fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg` in `serverExternalPackages`. Typecheck clean.
**Touched:** `src/lib/audio/analyze.ts` (new), `src/lib/video/prompt-scenes.ts` (new), `src/lib/video/assemble.ts` (new), `src/lib/inngest/functions/generate-video.ts` (new), `src/app/api/inngest/route.ts`, `next.config.ts`, `.env.example`, `package.json`
**Decided:** Claude tool use for structured scene prompts (Zod-validated) over raw text parsing — more reliable JSON output. `fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg` for serverless ffmpeg (no system binary needed).
**Blocked on:** `generated-videos` bucket (SQL one-liner), Kling API keys, `ANTHROPIC_API_KEY` in Vercel.
**Next:** Task 7 — `/portal/videos/new` artist video request UI.

### 2026-05-14 (session 13)

**Did:** Phase 3 Tasks 6–8 complete. Task 6 — asset upload (`/portal/assets` list + `/portal/assets/new` form): private-assets storage bucket, `uploadAsset` server action with `music-metadata` duration extraction, signed download URLs (60-min expiry), RLS scoped to artist's own assets. Task 7 — email templates: `src/lib/email/send.ts` Resend helper, 4 branded HTML templates (`applicationReceived`, `applicationApproved`, `applicationRejected`, `welcome`); wired into `submitApplication` (admin notification), `resendInvite` (portal invite to artist), `rejectApplication` (rejection notice to artist). Resend DNS verified for oneflamerecords.com; GoDaddy records added (`resend._domainkey` DKIM + SPF TXT). Task 8 — end-to-end test passed: submit → approve → invite email → set-password → portal → profile edit → asset upload → logout → login. Fixed critical auth callback bug: `generateLink({ type: 'recovery' })` returns tokens in hash fragment (implicit flow), not `?code=` (PKCE), so the Route Handler never saw the session. Replaced `src/app/auth/callback/route.ts` with a Client Component page that handles both PKCE and implicit flows. Updated `NEXT_PUBLIC_SITE_URL` in Vercel to production URL.
**Touched:** `src/app/portal/assets/`, `src/app/portal/assets/new/`, `src/components/AssetUploadForm.tsx`, `src/lib/email/send.ts`, `src/lib/email/templates/`, `src/app/(public)/signup/[code]/actions.ts`, `src/app/admin/applications/actions.ts`, `src/app/auth/callback/page.tsx` (replaced route.ts), `next.config.ts`, `.env.example`, `PROGRESS.md`
**Decided:** Auth callback must be a Client Component to handle implicit-flow hash fragments from admin-generated links. See DECISIONS.md.
**Blocked on:** Nothing.
**Next:** Phase 4 — Video automation.

### 2026-05-13 (session 12)

**Did:** Phase 3 Task 5 — Artist profile self-edit. `PortalProfileForm` client component (bio, photo, socials, streaming editable; stage_name/hometown/genres read-only with "contact label" note; `useEffect`-based "Saved." toast on success). `updateProfile` server action resolves `artist_id` from session (never trusts a hidden input), uses `createClient()` for the row update so `artists_update_self` RLS applies, uses service client only for storage upload. `/portal/profile` page fetches artist data server-side and handles the "no artist linked" edge case. `oneflamerecords.com` is now live on Vercel (DNS propagated during this session). 
**Touched:** `src/app/portal/profile/page.tsx`, `src/app/portal/profile/actions.ts`, `src/components/PortalProfileForm.tsx`, `PROGRESS.md`
**Decided:** Separate `PortalProfileForm` rather than adapting `ArtistForm` — keeps portal-specific field restrictions clean without adding conditionals to the admin component. Success state returned from action (`{ success: true }`) rather than redirect, so the artist stays on the page and sees the toast.
**Blocked on:** Resend DNS. End-to-end test still pending.
**Next:** Task 6 — Asset upload.

### 2026-05-13 (session 11)

**Did:** Phase 3 Task 4 — Portal layout & dashboard. Added `artists_select_self` RLS policy (migration + applied via CLI) so artists can read their own row when status is `pending`. Updated `src/proxy.ts` to redirect admins away from `/portal` → `/admin` (fetches profile once, covers both admin and portal role checks). Built `src/app/portal/layout.tsx` (ink theme, sidebar nav: Dashboard/Profile/Assets/Videos, top bar shows stage name via profiles→artists join with email fallback). Built `src/app/portal/page.tsx` (welcome header, three action tiles, recent uploads list with empty state, Phase 4 video jobs placeholder). Stub pages for profile/assets/videos.
**Touched:** `supabase/migrations/20260513200000_portal_artist_select.sql`, `src/proxy.ts`, `src/app/portal/layout.tsx`, `src/app/portal/page.tsx`, `src/app/portal/profile/page.tsx`, `src/app/portal/assets/page.tsx`, `src/app/portal/videos/page.tsx`
**Decided:** No `(portal)` route group — all portal routes share the `/portal` prefix so a plain layout.tsx suffices; avoids extra nesting. Portal uses `createClient()` (session-scoped, respects RLS) rather than service client.
**Blocked on:** Resend DNS. End-to-end approve+login flow not yet tested.
**Next:** Task 5 — Artist profile self-edit.

### 2026-05-13 (session 10)

**Did:** Phase 3 Task 3 — Applications review. List page (`/admin/applications`) shows all applications newest-first with pending/approved/rejected status badges and a count of pending items. Detail page (`/admin/applications/[id]`) shows all fields, clickable social links, and Approve/Reject buttons (only while pending). Approve action: invites artist via Supabase Admin `inviteUserByEmail` (sends invite email, triggers profiles row creation), creates `artists` row, links `profiles.artist_id`, marks application approved. Reject action: marks rejected. Both redirect back to list on success, show inline errors on failure.
**Touched:** `src/app/admin/applications/page.tsx`, `src/app/admin/applications/[id]/page.tsx`, `src/app/admin/applications/actions.ts`, `src/components/ApplicationActions.tsx`
**Decided:** Used `inviteUserByEmail` (not `createUser`) so the artist automatically receives a Supabase invite email to set their password — no Resend dependency for this step. Artist status set to `pending` (not `active`) until they complete onboarding.
**Blocked on:** `public-media` bucket. Resend DNS. End-to-end approve flow not yet tested (needs email delivery working).
**Next:** Task 4 — Portal layout & dashboard.

### 2026-05-13 (session 9)

**Did:** Phase 3 Tasks 1 and 2. Task 1 — `/admin/codes` signup codes manager: generate codes (12-char hex slug), QR image (ink/bone, server-side via `qrcode` package), copy-to-clipboard, PNG download, rotate button, rotated history table. Task 2 — `/signup/[code]` public application form: validates code server-side, shows "link expired" for inactive codes, full form (stage name, legal name, email, phone, genres, socials, message), honeypot, inserts into `signup_applications`. `robots: noindex` on the signup page.
**Touched:** `src/app/admin/codes/page.tsx`, `src/app/admin/codes/actions.ts`, `src/app/(public)/signup/[code]/page.tsx`, `src/app/(public)/signup/[code]/actions.ts`, `src/components/CopyButton.tsx`, `src/components/GenerateCodeForm.tsx`, `src/components/SignupForm.tsx`, `package.json`
**Decided:** No new architectural calls — followed established patterns (server action + useActionState, service client, cream theme for public signup page).
**Blocked on:** `public-media` bucket not created. Resend DNS still pending.
**Next:** Task 3 — Applications review in `/admin/applications`.

### 2026-05-13 (session 8)

**Did:** Built all 9 Phase 2 tasks — public layout shell (Task 1), homepage with live Supabase data (Task 2), artists list + detail pages (Task 3), releases list + detail pages (Task 4), videos page with filters (Task 5), about page with editorial timeline (Task 6), contact form with Resend + honeypot spam protection (Task 7), SEO/metadata pass — `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, JSON-LD, `metadataBase` (Task 8), Lighthouse audit + accessibility fixes — ochre→forest eyebrow contrast, footer `<h3>` → `<p>`, image alt text (Task 9).
**Touched:** `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/artists/`, `src/app/(public)/releases/`, `src/app/(public)/videos/page.tsx`, `src/app/(public)/about/page.tsx`, `src/app/(public)/contact/`, `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/layout.tsx`, `src/components/PublicHeader.tsx`, `src/components/PublicFooter.tsx`, `src/components/ArtistCard.tsx`, `src/components/ReleaseCard.tsx`, `src/components/VideoEmbed.tsx`, `src/components/ReleasesFilter.tsx`, `src/components/VideosFilter.tsx`, `src/components/ContactForm.tsx`, `src/components/SectionHeader.tsx`, `next.config.ts`, `PROGRESS.md`, `DECISIONS.md`
**Decided:** Ochre→forest for eyebrow text (contrast); server-component wrapper for pages needing metadata + client form; `createServiceClient` in sitemap.ts; click-to-play VideoEmbed; URL-based filtering for Releases/Videos. All logged in DECISIONS.md.
**Blocked on:** `public-media` bucket not yet created. Resend domain DNS pending verification.
**Next:** Phase 3 Task 1 — QR signup landing page (`/signup/[code]`) and application form.

### 2026-05-13 (session 7)

**Did:** Built Artists CRUD (Task 7), Releases CRUD (Task 8), and Videos CRUD (Task 9). Each section has a list page, new form, and edit form. Shared client components — ArtistForm, ReleaseForm, VideoForm — use `useActionState` for inline error display. Photo/cover uploads go to `public-media` bucket via service role. YouTube ID extraction in VideoForm accepts bare IDs or any youtube.com/youtu.be URL and previews the thumbnail live. Fixed a TypeScript error where `Record<string, unknown>` conflicted with Supabase's strict `.update()` type.
**Touched:** `next.config.ts`, `src/app/admin/artists/`, `src/app/admin/releases/`, `src/app/admin/videos/`, `src/components/ArtistForm.tsx`, `src/components/ReleaseForm.tsx`, `src/components/VideoForm.tsx`, `PROGRESS.md`
**Decided:** No new architectural decisions — followed the Server Action + useActionState pattern established in prior sessions.
**Blocked on:** `public-media` storage bucket not yet created (SQL editor one-liner in blockers above).
**Next:** Task 10 — Vercel deploy + domain.

### 2026-05-13 (session 6)

**Did:** Rebuilt admin layout shell (Task 6): ink-theme wrapper, sidebar nav, top bar with user email and logout button. Overview page with 4 live stat cards (artists, releases, videos, pending applications) using service client. Stub pages for all 7 nav sections. Typecheck clean.
**Touched:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/LogoutButton.tsx`, `src/app/admin/artists/page.tsx`, `src/app/admin/releases/page.tsx`, `src/app/admin/videos/page.tsx`, `src/app/admin/applications/page.tsx`, `src/app/admin/codes/page.tsx`, `src/app/admin/jobs/page.tsx`, `PROGRESS.md`
**Decided:** Nothing new.
**Blocked on:** Nothing.
**Next:** Task 7 — Artists CRUD.

### 2026-05-13 (session 5)

**Did:** Built login page (client-side auth via createBrowserClient), proxy route protecting /admin and /portal, stub admin and portal pages. Fixed several issues: middleware→proxy rename for Next.js 16, createServiceClient using raw supabase-js instead of @supabase/ssr (so service role actually bypasses RLS), login page always navigating to /admin (proxy handles role redirect with service role). Re-applied RLS policies via SQL editor (first run silently failed). Confirmed full flow: login → /admin → ink dashboard.
**Touched:** `src/app/login/page.tsx`, `src/proxy.ts`, `src/lib/supabase/server.ts`, `src/app/admin/page.tsx`, `src/app/portal/page.tsx`, `PROGRESS.md`
**Decided:** Client-side signInWithPassword (not Server Action) required for Next.js 16 — cookies from Server Action redirects don't survive the response reliably. Proxy uses inline service client (not imported from server.ts) to avoid next/headers in Edge Runtime. See DECISIONS.md.
**Blocked on:** Nothing.
**Next:** Task 6 — admin layout shell.

### 2026-05-13 (session 4)

**Did:** Wrote RLS migration — `is_admin()` + `current_artist_id()` helpers, enabled RLS on all 8 tables, wrote all policies per architecture.md. Applied via SQL editor, repaired migration history.
**Touched:** `supabase/migrations/20260513154209_add_rls_policies.sql`, `src/types/supabase.ts`, `PROGRESS.md`
**Decided:** Column-level restriction on artist self-edit of `artists` enforced at app layer (not RLS), since RLS can't restrict individual columns natively.
**Blocked on:** Nothing.
**Next:** Task 5 — login page, Server Action, middleware.

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
