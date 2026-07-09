# Phase 5 — Polish, Hardening & Content

**Goal:** The platform is fully functional after Phase 4. Phase 5 closes remaining rough edges, adds real content, and hardens the production deployment so the label can use it confidently day-to-day.

**Done when:** All cleanup items from Phases 1–4 are resolved, at least one real news post is live, the admin can manage all content types without friction, and the site is resilient to errors.

---

## Task 1 — Admin videos list polish ✅

**Already done:** Fallback thumbnail (film icon) for uploaded (non-YouTube) videos. "Uploaded" label instead of null youtube_id in the subtitle.

---

## Task 2 — First real news post + verification

**Do:**
- Log in to `/admin/news/new` and create the label's first real news post (category: label, publish date: today, is_published: on).
- Verify it appears correctly on the public `/news` page (card grid with title, excerpt, cover, date).
- Verify the homepage "Latest News" row shows it.
- Click through to the post detail page and confirm Markdown renders correctly.
- Check that an unpublished (draft) post does NOT appear on the public site.

**Acceptance:**
- One real published post visible at `/news` and on the homepage.
- Draft posts remain hidden from public readers.

---

## Task 3 — Generated video download in portal

**Do:**
- On the portal `/portal/videos/[job_id]` detail page, add a **Download MP4** button below the video player for completed jobs.
- Use a short-lived signed URL (the job already stores `result_url` or similar) — if the URL is already a 7-day signed Supabase URL, link directly; add a note that the link expires.
- The button should be visually secondary (bone outline) to the "Share" or main CTA, and only visible when `status === 'complete'`.

**Acceptance:**
- Clicking Download opens the MP4 in a new tab or triggers a browser download.
- Button is absent for in-progress and failed jobs.

---

## Task 4 — Portal generated-video public share toggle

**Do:**
- Artists currently can't control whether their generated videos appear on the public `/videos` page.
- On the portal job detail page, add a **"Show on public site"** toggle (matches the admin toggle that already exists at `/admin/artists/[id]/videos`).
- Wire it to a `toggleJobPublic` portal action that checks the current artist owns the job before updating (RLS guards this at DB level too).

**Acceptance:**
- Artist can toggle visibility from the portal.
- Change reflects immediately on the public `/videos` page.

---

## Task 5 — Error tracking (Sentry)

**Do:**
- Install `@sentry/nextjs`.
- Run `npx @sentry/wizard@latest -i nextjs` to generate `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and instrument `next.config.ts`.
- Add `SENTRY_DSN` to `.env.local` and Vercel env vars.
- Verify a test error is captured in the Sentry dashboard.
- Add Sentry to `.env.example`.

**Acceptance:**
- Unhandled server errors surface in Sentry with stack traces.
- Client-side errors are also captured.
- No PII (session tokens, Supabase keys) is sent to Sentry.

---

## Task 6 — Image domain allowlist audit

**Do:**
- Audit `next.config.ts` `images.remotePatterns` — ensure all external image hosts (Supabase storage URL, YouTube thumbnails `img.youtube.com`, any artist social avatars) are allowlisted and not over-broad.
- Add `img.youtube.com` if missing (YouTube thumbnails used in admin videos list).
- Test that `<Image>` components render without console warnings in production.

**Acceptance:**
- No `next/image` hostname warnings in Vercel build logs.
- All images load in production.

---

## Task 7 — Sitemap freshness

**Do:**
- The existing `src/app/sitemap.ts` may not include `/news/[slug]` URLs or generated video pages.
- Extend the sitemap to include all published news posts (slug, published_at as lastModified).
- Confirm news pages and artist/release pages all appear.
- Submit the updated sitemap URL to Google Search Console.

**Acceptance:**
- `GET /sitemap.xml` includes at least: `/`, `/artists`, `/releases`, `/videos`, `/news`, plus each published news post URL.

---

## Task 8 — Content pass: about page and roster

**Do:**
- Replace any placeholder copy on `/about` with real label history and editorial voice.
- Add any missing artists to the roster (admin `/admin/artists/new`).
- Add real cover art and streaming links to any releases missing them.
- Review `/admin/videos` — ensure all official music videos have correct kind labels.

**Acceptance:**
- Public site reads as a real, populated label — no placeholder text visible.

---

## Task 9 — Mobile UX spot-check

**Do:**
- Walk through the public site on a real mobile device (or DevTools emulation) at 375px width:
  - Homepage hero, artists grid, releases grid, videos grid, news grid, about page, sign page.
  - Individual artist, release, news post detail pages.
- Fix any overflow, font-size, or spacing issues found.
- Portal: test the video request flow and job list on mobile.

**Acceptance:**
- No horizontal scroll on any public page at 375px.
- All CTAs are tappable (min 44×44px).

---

## Task 10 — Phase 5 wrap-up

- Update `PROGRESS.md` → Phase 5 complete.
- Update `DECISIONS.md` with any non-obvious choices made during this phase.
- `git tag phase-5-complete && git push --tags`.

---

## Out of scope for Phase 5

These are real improvements but belong in a later phase once the label has been using the platform for a few weeks:

- Lyric overlay synchronization.
- Royalty tracking / statement generation.
- Streaming DSP distribution integration (DistroKid API, etc.).
- Advanced analytics dashboard.
- Automated social media posting of generated videos.
- Multi-language support.
