# Progress

This is the living state of the build. Update at the end of every session.

---

## Current state

- **Phase:** Bar POS operational + ongoing content
- **Status:** Phases 1–5 complete. Bar POS fully built, all migrations applied to production, menu items seeded, dual-access bartender system live. Two full code-review passes applied and clean.
- **Last updated:** 2026-06-22 (session 35)

## Active focus

First real POS session — promote an artist to bartender, navigate to `/bar` via new portal nav link, open first tab, run the core loop.

## Blockers

- **TikTok auto-posting** — Make.com has no TikTok video upload module. Manual for now.
- **Flames Lounge gallery** — Gallery grid still placeholder; swap with real photos when available.

## Next session

### Priority 1 — First live bar POS run
1. Admin → Bar → Staff → "Promote Existing Artist" → enter artist's email → grant bar access
2. Have that artist log in to `/bar`, open a tab, add items, close as cash
3. Verify `/admin/bar` shows correct sales totals in Jamaica timezone

### Priority 2 — Content entry (ongoing, via admin)
- Add artists with photos at `/admin/artists`
- Add releases with cover art at `/admin/releases`
- Publish first news post

## Phase progress

- [x] **Phase 1** — Admin foundation _(complete)_
- [x] **Phase 2** — Public site _(complete)_
- [x] **Phase 3** — QR onboarding + artist portal _(complete)_
- [x] **Phase 4** — Video automation _(complete)_
- [x] **Phase 5** — Polish, hardening & content _(complete)_

---

## Session log

Append a new entry at the top of this section after every session. Date, summary, files touched, what's next. Keep it tight — full reasoning belongs in `DECISIONS.md`.

### 2026-06-22 (session 35)

**Did:** Two code-review passes + type system restoration. Session started mid-review (second `/code-review` from session 34 was interrupted by context compaction). Completed Phase 2 verification of 7 candidates, all CONFIRMED except sessions-page caching (REFUTED — already dynamic via cookies()). Fixed all 7 findings: (1) `sessions/page.tsx` today's sessions query switched from `gte("started_at", ...)` to `gte("ended_at", ...)` so overnight sessions (started before midnight, ended after) appear correctly. (2) `admin/bar/items/page.tsx` local `CATEGORY_LABELS` was missing `snack` — removed the local copy, now imports from `pos.ts` (snack items display "Snacks" correctly). (3) `actions.ts` stock decrement now checks the update result and returns an error on failure. (4) Full TOCTOU fix for stock and tab total: new migration `20260622000001_atomic_stock_and_tab_total.sql` adds three Postgres functions (`decrement_pos_item_stock`, `increment_tab_total`, `decrement_tab_total`); `addItemToTab` captures the inserted row ID, calls the atomic stock RPC and rolls back the insert if it races to zero; tab total now uses SQL arithmetic via RPCs in both add and remove paths. (5) `elapsed()` extracted to `pos.ts`, local copies removed from `bar/page.tsx` and `sessions/page.tsx`. (6) `gamer_members` display_name resolution extracted to `getName()` helper in sessions page, deduplicating two identical inline blocks. (7) `Array.isArray` dead code removed from `portal/layout.tsx` (to-one FK always returns object). Also restored Supabase types (file had been empty) — generated 1083-line types file using new PAT, removed `as any` casts from RPC calls in `actions.ts`.
**Touched:** `src/app/bar/sessions/page.tsx`, `src/app/bar/page.tsx`, `src/app/bar/tabs/[id]/actions.ts`, `src/app/portal/layout.tsx`, `src/app/admin/bar/items/page.tsx`, `src/lib/bar/pos.ts`, `supabase/migrations/20260622000001_atomic_stock_and_tab_total.sql`, `src/types/supabase.ts`
**Decided:** Atomic RPCs for stock decrement and tab total — logged in DECISIONS.md.
**Blocked on:** Flames Lounge gallery photos. TikTok auto-posting.
**Next:** First live bar POS session. Content entry via admin.

### 2026-06-21 (session 34)

**Did:** One bug fix before first live bar session. Discovered that artist-bartenders (role=artist, is_bartender=true) had no navigation link to `/bar` from the portal — they'd need to type the URL manually, which is a blocker for the live test. Fixed: (1) Added `isBartender?: boolean` prop to `InkShell`. When `mode="portal"` and `isBartender=true`, a "Bar POS →" nav group is appended to the portal sidebar nav. (2) Updated `portal/layout.tsx` to select `is_bartender` alongside `artist_id` from profiles and pass it down. Typecheck clean.
**Touched:** `src/components/InkShell.tsx`, `src/app/portal/layout.tsx`
**Decided:** Nothing new architecturally — follows existing `InkShell` mode/prop pattern.
**Blocked on:** Flames Lounge gallery photos (still placeholder). Content entry pending real artists/releases/news.
**Next:** First live bar session — promote an artist, open tab, add items, close as cash, verify admin overview totals. Content entry via admin UI.

### 2026-06-21 (session 33)

**Did:** Full bar POS polish pass + dual-access bartender system. (1) **Inventory consolidation** — Admin inventory page now shows all items (inactive at `opacity-40`) with Edit links and "+ Add Item" button; removed "Menu Items" from ADMIN_NAV (redundant); added "Inventory" to BAR_NAV for read-only bartender view. (2) **Bartender dashboard** — rewritten to show 3 stat chips (Today's Sales / Open Running / Tabs Closed), open tabs grid, and "Settled Today" table with day total. (3) **Shared bar lib** (`src/lib/bar/pos.ts`) — extracted `formatCents`, `CATEGORY_LABELS`, `CATEGORY_ORDER`, `jamaicaMidnight(daysAgo)`, `jamaicaTime()`, `jamaicaDateTime()` used across 7+ files; eliminated duplicate `fmt()` copies and UTC midnight timezone bugs. (4) **Jamaica timezone fix** — all "today" queries now use `jamaicaMidnight()` (Jamaica midnight = 05:00 UTC); all time display uses `timeZone: "America/Jamaica"`. (5) **Snacks category** — extended `pos_items_category_check` constraint; seeded 8 snack items (YardWorks chips x3, Big Foot x2, Sausage x2, Cup Soup). (6) **is_bartender dual-access** — `profiles.is_bartender BOOLEAN DEFAULT FALSE` migration applied; proxy + `requireBarStaff()` accept `is_bartender = true` alongside `role = 'bartender'`; admin bar staff page shows both types with "Artist + Bar" badge and context-appropriate revoke vs deactivate actions; `assignBartenderFlag` action looks up by email and flips flag; `PromoteBartenderForm` client component; `revokeBartenderFlag` just unsets flag (does not ban artist). Also seeded drinks during this session: Campari/Kingston 62/Red Label/Magnum/Boom (small+large)/Craven A single.
**Touched:** `supabase/migrations/20260621000007_add_snack_items.sql` (new), `supabase/migrations/20260621000008_is_bartender_flag.sql` (new), `src/lib/bar/pos.ts` (new), `src/types/supabase.ts`, `src/proxy.ts`, `src/lib/auth.ts`, `src/app/admin/bar/staff/actions.ts`, `src/app/admin/bar/staff/page.tsx`, `src/app/admin/bar/staff/PromoteBartenderForm.tsx` (new), `src/app/bar/page.tsx`, `src/app/bar/inventory/page.tsx` (new), `src/app/admin/bar/page.tsx`, `src/app/admin/bar/inventory/page.tsx`, `src/app/admin/bar/sales/page.tsx`, `src/app/admin/bar/tabs/page.tsx`, `src/components/InkShell.tsx`, `src/components/MenuGrid.tsx`, `src/components/MenuItemForm.tsx`
**Decided:** `is_bartender` boolean flag (not a second role or junction table) for artist dual-access — artist keeps portal access while gaining bar access. Logged in DECISIONS.md.
**Blocked on:** Nothing.
**Next:** First live bar session — promote an artist to bartender, open first real tab.

### 2026-06-17 (session 32)

**Did:** (1) Wrote `regenerateCampaignPiece` Inngest function (`src/lib/inngest/functions/regenerate-campaign-piece.ts`) to handle the previously unregistered `campaign/regenerate-piece.requested` event. Since `angle` and `image_needed` are ephemeral plan outputs not stored in `content_pieces`, the handler derives a fresh creative angle via Claude (Step 3: "derive-angle") and infers `image_needed` from `content_type` (true for `image_post`/`story`, false otherwise). Runs full content pipeline: caption+hashtags, video script (if `video_mode` is "script" or "generated"), AI image (if `image_needed`). Fires `campaign/video.requested` after completion if `video_mode === "generated"`. Registered in `src/app/api/inngest/route.ts`. (2) Fixed lint error in `ShareToggle.tsx` — replaced two `useEffect` setState calls (which triggered cascade-render lint rule) with render-time prop sync using `prevIsPublic` state pattern + derived `effective` value when error is present.
**Touched:** `src/lib/inngest/functions/regenerate-campaign-piece.ts` (new), `src/app/api/inngest/route.ts`, `src/app/portal/videos/[job_id]/ShareToggle.tsx`
**Decided:** `regenerateCampaignPiece` generates a fresh angle rather than reading a stored one (angle was never persisted to DB). `image_needed` inferred from `content_type` — `image_post`/`story` need images; video and text types do not.
**Next:** Bar POS operations: add menu items at `/admin/bar/items`, invite bartender at `/admin/bar/staff`, test core POS loop.

### 2026-06-17 (session 31)

**Did:** (1) Confirmed POS migration already applied to production (`Remote database is up to date`). (2) Fixed campaign video generation gap — `generate-campaign.ts` now generates a Claude video script for `video_mode === "generated"` pieces (same as "script" mode; required because `generate-campaign-video` reads the script to make scene prompts). After `mark-review`, fires `campaign/video.requested` events in batch for all generated-mode piece IDs to trigger the `generate-campaign-video` Inngest function. Existing stale pieces can be re-triggered via `triggerCampaignVideo` from the admin campaign detail page.
**Touched:** `src/lib/inngest/functions/generate-campaign.ts`
**Decided:** Cleared the campaign video generation gap blocker. Stale pieces need manual admin re-trigger.
**Next:** Bar POS operations: add menu items at `/admin/bar/items`, invite bartender at `/admin/bar/staff`, test core POS loop.

### 2026-06-17 (session 30)

**Did:** Phase 5 complete. (1) **Code review fixes on share toggle** — added `revalidatePath` for `/portal/videos` list, `/videos` public page, and `/artists` layout so all affected pages update after a visibility toggle; added explicit `artist_id` filter on UPDATE as belt-and-suspenders beyond RLS; normalised raw Postgres error to generic message; fixed stale `isPublic` prop with `useState` optimistic flip on submit + `useEffect` revert on error. (2) **Mobile QA** — bar POS tab page height now uses `dvh` with correct breakpoint calculations accounting for InkShell header (`h-16`/`h-20`) + bar layout padding (`p-4`/`p-6`/`p-8`); added `min-h-0` to tab items list and MenuGrid grid so `overflow-y-auto` actually triggers on mobile flex containers. Public pages audited — all responsive, no changes needed.
**Touched:** `src/app/portal/videos/[job_id]/actions.ts`, `src/app/portal/videos/[job_id]/ShareToggle.tsx`, `src/app/bar/tabs/[id]/page.tsx`, `src/components/MenuGrid.tsx`
**Decided:** Phase 5 "content pass" is an ongoing admin data-entry task (roster, releases, cover art), not a code task. Pages are all database-driven and will populate when content is entered via `/admin`.
**Next:** `npx supabase db push --linked` → add menu items → invite bartender → test POS loop.

### 2026-06-17 (session 29 cont.)

**Did:** Phase 5 Task 1 — portal video public/private share toggle. Added `toggleVideoPublic` Server Action (`src/app/portal/videos/[job_id]/actions.ts`) using session client (RLS enforces artist can only update own jobs); guards status === "complete" before toggling. `ShareToggle` client component (`ShareToggle.tsx`) uses `useActionState`, renders green-pill if public / gray if private. Wired into the video detail page right column sidebar inside a "Visibility" card, only shown for completed jobs.
**Touched:** `src/app/portal/videos/[job_id]/actions.ts` (new), `src/app/portal/videos/[job_id]/ShareToggle.tsx` (new), `src/app/portal/videos/[job_id]/page.tsx`
**Next:** Content pass + mobile QA (Phase 5 remaining). Bar POS launch: `npx supabase db push --linked` → add menu items → invite bartender.

### 2026-06-17 (sessions 28–29)

**Did:** Full Bar POS + Gaming Membership system. (1) **Database migration** (`20260617000001_pos_and_gaming.sql`) — extended `profiles_role_check` to include `bartender` and `gamer`; updated `handle_new_user()` trigger to read `raw_user_meta_data->>'role'` so invites with a role payload land correctly; added `is_bar_staff()` SECURITY DEFINER helper; added `current_gamer_member_id()` function; created 5 tables: `pos_items`, `pos_tabs`, `pos_tab_items`, `gamer_members`, `game_sessions`; full RLS policies on all tables using `is_admin()` and `is_bar_staff()`. (2) **Auth layer** — `requireBarStaff()` added to `src/lib/auth.ts`; `src/proxy.ts` rewritten with `roleHome()` helper mapping roles to home routes; `/bar` and `/gamer` route groups added; `src/app/auth/set-password/page.tsx` now redirects to `/admin` so proxy routes each role correctly. (3) **InkShell** — `mode="bar"` and `mode="gamer"` added; `BAR_NAV` and `GAMER_NAV` constants; "Bar" group added to `ADMIN_NAV`. (4) **Admin bar** — `/admin/bar` overview (stat cards + open tabs); `/admin/bar/items` CRUD (create/edit/deactivate/delete menu items); `/admin/bar/tabs` order history with revenue totals; `/admin/bar/members` gamer member list + detail with balance adjust and suspend/reactivate; `/admin/bar/staff` invite/deactivate bartenders. (5) **Bartender `/bar` POS** — layout + active tabs dashboard; open tab form (`pos_tabs` insert + redirect); tab view (item list + `MenuGrid` touch grid + `TabControls` close/void modal); sessions page (start/end game sessions, deducts member balance); members search + invite gamer + member detail. (6) **Gamer portal** — `/gamer` layout (fetches `gamer_members` for display name); dashboard (balance, active session); session history. (7) **Public gamer signup** — `/gamer-signup` page with self-serve form; `gamerSignup` action invites via `auth.admin.inviteUserByEmail` with `{ role: "gamer" }`, creates `gamer_members` row; CTA added to Flames Lounge public page. Supabase types manually extended for all 5 new tables. Typecheck 0 errors, lint 0 errors.
**Touched:** `supabase/migrations/20260617000001_pos_and_gaming.sql` (new), `src/types/supabase.ts`, `src/lib/auth.ts`, `src/proxy.ts`, `src/app/auth/set-password/page.tsx`, `src/components/InkShell.tsx`, `src/components/MenuGrid.tsx` (new), `src/app/admin/bar/` (all new), `src/app/bar/` (all new), `src/app/gamer/` (all new), `src/app/(public)/gamer-signup/` (new), `src/app/(public)/flames-lounge/page.tsx`
**Decided:** Single `roleHome()` helper in proxy consolidates all role-to-home-route logic. `is_bar_staff()` SECURITY DEFINER avoids exposing `profiles` table directly in RLS. `gamer_members` created immediately on invite (before password set) so bartender can add notes/balance before first login. Prices stored as cents throughout.
**Blocked on:** Migration not yet applied to production. Bartender accounts not yet invited.
**Next:** `npx supabase db push --linked` → add menu items → invite bartender → test core POS loop.

### 2026-06-08 (session 27)

**Did:** Comprehensive site audit — security hardening, code-review bug fixes, Vercel Analytics, and full lint cleanup. (1) **Code-review fixes** — 10 bugs fixed: `onFailure` status set to `"failed"` (was `"approved"`), `downloadFile` HTTP status check, JSON parse `indexOf('[')` guard, `try/finally` cleanup for `/tmp` in assemble-upload, `fs.createReadStream` for upload, duplicate video generation guard, Resend batch error checked, `deleteEvent` error propagated, flames-lounge swapped to `createClient()`, CampaignPiecesClient error display added. (2) **Vercel Analytics + Speed Insights** — `@vercel/analytics` and `@vercel/speed-insights` added to root layout. (3) **Admin action auth** — `requireAdmin()` added to 13 files that were missing it (jobs, codes, settings, releases, videos, artists, news new/edit, applications, artist assets, artist videos, artist videos/new including `generateScriptAction`). (4) **ESLint clean to zero errors** — all `react/no-unescaped-entities` fixed across 10 files; `no-html-link-for-pages` fixed in `releases/page.tsx`; `NavLinks` extracted from `InkShell` render to module-level component (fixes `cannot-create-components-during-render`); `VideoForm` `useEffect` removed in favour of derived state; `kling.ts`/`higgsfield.ts` `require()` calls suppressed. Typecheck passes clean throughout.
**Touched:** `src/lib/inngest/functions/generate-campaign-video.ts`, `src/app/admin/campaigns/[id]/actions.ts`, `src/app/admin/campaigns/[id]/CampaignPiecesClient.tsx`, `src/app/admin/subscribers/actions.ts`, `src/app/admin/events/actions.ts`, `src/app/admin/events/[id]/edit/DeleteEventButton.tsx`, `src/app/(public)/flames-lounge/page.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/releases/page.tsx`, `src/app/(public)/sign/page.tsx`, `src/app/admin/ai-studio/images/ImageGeneratorForm.tsx`, `src/app/admin/applications/actions.ts`, `src/app/admin/artists/[id]/assets/actions.ts`, `src/app/admin/artists/[id]/videos/actions.ts`, `src/app/admin/artists/[id]/videos/new/actions.ts`, `src/app/admin/artists/[id]/videos/page.tsx`, `src/app/admin/artists/actions.ts`, `src/app/admin/campaigns/ideas/IdeasClient.tsx`, `src/app/admin/campaigns/ideas/page.tsx`, `src/app/admin/codes/actions.ts`, `src/app/admin/jobs/actions.ts`, `src/app/admin/news/[id]/edit/actions.ts`, `src/app/admin/news/new/actions.ts`, `src/app/admin/releases/actions.ts`, `src/app/admin/settings/actions.ts`, `src/app/admin/videos/actions.ts`, `src/app/portal/profile/page.tsx`, `src/app/portal/videos/new/page.tsx`, `src/components/InkShell.tsx`, `src/components/PortalProfileForm.tsx`, `src/components/VideoForm.tsx`, `src/lib/video/providers/higgsfield.ts`, `src/lib/video/providers/kling.ts`, `package.json`, `src/app/layout.tsx`
**Decided:** Server Actions bypass Next.js middleware route protection — `requireAdmin()` must be called inside each exported async Server Action, not just at the middleware level.
**Blocked on:** TikTok auto-post. Flames Lounge gallery photos. Campaign video generation gap (pieces with video_mode="generated" produce script but no video_url).
**Next:** Phase 5 remaining — portal share toggle, content pass, mobile QA on real device.

### 2026-06-06 (session 26)

**Did:** Major bug-fix + feature session. (1) **Campaign ideas** — fixed `PILLARS` exported from `"use server"` file (production crash); moved to `constants.ts`. Fixed markdown code fences in Claude JSON responses. Fixed `suggested_platforms.join` null crash in IdeaCard. Replaced `window.location.reload()` with `router.refresh()`. Added `→ News post` button — creates a draft `news_posts` from an idea and redirects to edit. Pre-select all platforms when starting campaign from idea. (2) **Campaign pipeline** — added `"news"` as a platform: `news_post` content type; Inngest generates article (title + markdown body via Claude); DB migrations to allow `news_post` in content_type and platform check constraints (applied via SQL editor). News pieces render as article cards in campaign review; platform picker hidden for news pieces; publish action creates draft `news_posts`. (3) **News edit page** — fixed `onClick` in Server Component (production crash); extracted `DeletePostButton` Client Component. (4) **Draft news leak** — public news queries now have explicit `.eq("is_published", true)` + `.or("published_at.is.null,published_at.lte.${now}")` filters so admin session doesn't leak drafts. (5) **Admin logo** — top bar and sidebar logos now link to `/` (public homepage). (6) **Sentry + Make.com** — `NEXT_PUBLIC_SENTRY_DSN` added to Vercel (active). `SOCIAL_WEBHOOK_URL` added to Vercel. Meta credentials obtained (`FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_ACCESS_TOKEN`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`). All social posting routed through Make.com webhook. Inngest synced, `generate-campaign` function now runs in production.
**Touched:** `src/app/admin/campaigns/ideas/constants.ts` (new), `src/app/admin/campaigns/ideas/actions.ts`, `src/app/admin/campaigns/ideas/IdeasClient.tsx`, `src/app/admin/campaigns/ideas/page.tsx`, `src/app/admin/campaigns/new/CampaignForm.tsx`, `src/lib/inngest/functions/generate-campaign.ts`, `src/app/admin/campaigns/[id]/actions.ts`, `src/app/admin/campaigns/[id]/CampaignPiecesClient.tsx`, `src/app/admin/news/[id]/edit/DeletePostButton.tsx` (new), `src/app/admin/news/[id]/edit/page.tsx`, `src/app/(public)/news/page.tsx`, `src/app/(public)/news/[slug]/page.tsx`, `src/app/(public)/page.tsx`, `src/components/InkShell.tsx`, `src/lib/social/meta.ts`, `src/lib/social/tiktok.ts`, `supabase/migrations/20260606000001_content_pieces_news_type.sql` (new, applied), `src/app/admin/error.tsx` (new)
**Decided:** Make.com over direct social APIs (no TikTok module, avoids FB auth complexity). `router.refresh()` over `window.location.reload()` after server actions. News posts from campaigns store title in `caption`, body in `video_script`. Null `published_at` treated as immediately visible.
**Blocked on:** TikTok auto-post. Flames Lounge gallery. Campaign video generation gap.
**Next:** Phase 5 remaining — portal share toggle, content pass, mobile QA.

### 2026-06-06 (session 25)

**Did:** Social posting infrastructure + Sentry activation. (1) **Make.com webhook** — Replaced all direct Meta Graph API and TikTok API calls with a single `SOCIAL_WEBHOOK_URL` webhook. `src/lib/social/meta.ts` and `src/lib/social/tiktok.ts` now fire JSON payloads (`platform`, `content_type`, `caption`, `image_url`, `video_url`, `piece_id`) to Make.com. Make.com handles the actual platform posting via native modules. `SOCIAL_WEBHOOK_URL` added to Vercel. (2) **Meta credentials obtained** — Walked through Facebook Developer App setup: retrieved `FACEBOOK_PAGE_ID` (463635280167554), never-expiring `FACEBOOK_PAGE_ACCESS_TOKEN`, and `INSTAGRAM_BUSINESS_ACCOUNT_ID` (17841457606500034) — stored in Vercel for reference even though the app now uses Make.com. (3) **TikTok** — Make.com has no TikTok video upload module; manual posting for now. Publer evaluated as best third-party option if TikTok automation is needed later ($12/month, direct TikTok video publish, native webhooks). (4) **Sentry live** — `NEXT_PUBLIC_SENTRY_DSN` added to Vercel; error tracking now active in production.
**Touched:** `src/lib/social/meta.ts`, `src/lib/social/tiktok.ts`, `.env.example`, `PROGRESS.md`
**Decided:** Make.com over direct API for social posting — avoids Facebook developer app complexity and TikTok approval delays. Single `SOCIAL_WEBHOOK_URL` for all platforms; Make.com Router branches on `platform` field.
**Blocked on:** TikTok auto-post (no Make.com module). Flames Lounge gallery photos.
**Next:** First real news post. Phase 5 wrap-up review.

### 2026-06-05 (session 24)

**Did:** Three items. (1) **Flames Lounge hero** — Downloaded full-res Unsplash outdoor bar at dusk photo (Daesun Kim, `photo-1763872625791`), saved as `public/flames-lounge-hero.jpg` (1.2 MB). Replaced placeholder gradient in the hero section with `next/image fill + object-cover` + a 65% dark overlay + the existing flame glow on top. Removed the flame watermark placeholder. (2) **Portal download button** — Added "Download MP4 ↓" anchor with `download` attribute alongside the existing "Watch video →" button on `/portal/videos/[job_id]` for complete jobs. Button styled as ghost/outlined vs. the filled ochre Watch button. (3) **Sentry** — Installed `@sentry/nextjs@10.56.0`. Created `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` at project root. Created `src/instrumentation.ts` (Next.js App Router hook that imports Sentry for nodejs/edge runtimes). Created `src/app/global-error.tsx` (root error boundary that calls `Sentry.captureException`). Wrapped `next.config.ts` with `withSentryConfig`. Added `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` to `.env.example`. **Sentry will not activate until `NEXT_PUBLIC_SENTRY_DSN` is added to Vercel env vars.** Typecheck clean throughout.
**Touched:** `public/flames-lounge-hero.jpg` (new), `src/app/(public)/flames-lounge/page.tsx`, `src/app/portal/videos/[job_id]/page.tsx`, `sentry.client.config.ts` (new), `sentry.server.config.ts` (new), `sentry.edge.config.ts` (new), `src/instrumentation.ts` (new), `src/app/global-error.tsx` (new), `next.config.ts`, `.env.example`
**Decided:** Used Unsplash CDN URL directly (q=85, w=3000) — royalty-free under Unsplash License. `NEXT_PUBLIC_SENTRY_DSN` prefix so it's available both server-side and in client bundle (required for `sentry.client.config.ts`). `tracesSampleRate: 0.1` in production to avoid trace quota burn.
**Blocked on:** Sentry DSN not in Vercel yet. Meta + TikTok API keys not set. Gallery photos still placeholder.
**Next:** Add Sentry DSN to Vercel → verify. Add Meta/TikTok keys. Create first real news post.

### 2026-06-05 (session 23)

**Did:** Major build session — admin overhaul, AI content pipeline, security hardening, and the Flames Lounge page. (1) **Admin videos** — Watch links, video player on edit page, storage_url passed to VideoForm. (2) **Admin artist section revamp** — card grid with photo strips, status filter chips, asset/job counts, genre pills; edit page gets breadcrumb, live photo, counts, and public profile link. (3) **Admin redesign** — InkShell nav grouped into Catalog / AI Studio / Onboarding; overview rebuilt as operational dashboard (stats, quick actions, spend bar, active jobs, pending apps). (4) **AI Studio** — hub page, Image Generator (gpt-image-1, replaces dall-e-3 which is deprecated), Copy Generator (Claude), reference image support (from artist assets or upload), image library table + gallery page. (5) **Content campaigns** — `content_campaigns` + `content_pieces` tables; `/admin/campaigns` list and new form; Inngest `generate-campaign` pipeline (Claude plan → parallel piece generation with captions + images + video scripts); campaign detail page with per-piece approve/reject/regenerate; `publishApproved` action posts to Instagram, Facebook, TikTok via their APIs. (6) **Campaign ideas** — `campaign_ideas` table; `/admin/campaigns/ideas` gallery grouped by 6 content pillars; `generateIdeas` reads roster/releases/news for context; "Start Campaign" pre-fills the form. (7) **Security hardening** — `src/lib/auth.ts` `requireAdmin()` applied to all admin server actions; `<source>` delimiters around user content in AI prompts; Facebook token moved to Authorization header; file type/size validation on uploaded reference images; HTTPS-only validation on social posting URLs; lazy SDK init to fix build failure. (8) **Flames Lounge** — `/flames-lounge` public page: atmospheric dark hero, about section, four-pillar grid, outdoor studio feature card, Jamaican fritters menu, events grid, photo gallery placeholder, oxblood CTA band; `@flamesmobay` Instagram + TikTok links; added to PublicHeader nav and sitemap. (9) **Sitemap** — extended with `/news`, `/news/[slug]`, `/flames-lounge`, `/sign`.
**Touched:** `src/app/admin/videos/page.tsx`, `src/app/admin/videos/[id]/edit/page.tsx`, `src/components/VideoForm.tsx`, `src/app/admin/artists/page.tsx`, `src/app/admin/artists/[id]/edit/page.tsx`, `src/app/admin/artists/actions.ts`, `src/components/InkShell.tsx`, `src/app/admin/layout.tsx`, `src/app/portal/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/news/page.tsx`, `src/app/admin/videos/actions.ts`, `src/components/ArtistForm.tsx`, `src/components/ReleaseForm.tsx`, `src/components/NewsForm.tsx`, `src/app/admin/ai-studio/` (all new), `src/app/admin/campaigns/` (all new), `src/lib/inngest/functions/generate-campaign.ts`, `src/lib/social/meta.ts`, `src/lib/social/tiktok.ts`, `src/lib/auth.ts`, `src/app/(public)/flames-lounge/page.tsx`, `src/components/PublicHeader.tsx`, `src/app/sitemap.ts`, `supabase/migrations/20260604000001_campaigns_and_image_library.sql`, `supabase/migrations/20260604000002_campaign_ideas.sql`, `src/types/supabase.ts`
**Decided:** gpt-image-1 over dall-e-3 (deprecated for most accounts). `requireAdmin()` for defense-in-depth on server actions (middleware alone insufficient). `<source>` XML delimiters for prompt injection mitigation. Inngest for campaign generation pipeline (same pattern as video pipeline). See DECISIONS.md.
**Blocked on:** Meta + TikTok API keys not yet in Vercel. Flames Lounge hero photo still placeholder.
**Next:** Flames Lounge hero photo → portal download button → Sentry → social API keys.

### 2026-06-04 (session 22)

**Did:** Phase 4 sign-off + Phase 5 start. (1) Admin videos list polish — added `storage_url` to the select query; replaced broken YouTube thumbnail URL with a film-icon placeholder for uploaded (non-YouTube) videos; subtitle now shows "Uploaded" instead of null `youtube_id`. Typecheck clean. (2) Phase 4 marked complete (all 11 tasks done, pipeline live end-to-end in production). (3) Phase 5 scoped and documented at `phase-5-polish-hardening.md` — 10 tasks covering news content, portal download button, public share toggle, Sentry, image domain audit, sitemap freshness, content pass, and mobile QA.
**Touched:** `src/app/admin/videos/page.tsx`, `PROGRESS.md`, `phase-5-polish-hardening.md` (new)
**Decided:** Phase 4 complete. Phase 5 is polish + hardening, not new features.
**Blocked on:** Nothing.
**Next:** Create first real news post (manual, admin UI). Portal generated-video download button. Sentry setup.

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
