# Decisions

Append-only log of architectural decisions. Never edit a past entry — write a new one that supersedes it, and link back.

Format for each entry:

```
## YYYY-MM-DD — Short decision title
**Context:** what situation forced this choice
**Decision:** what we're doing
**Alternatives considered:** what we rejected and why
**Consequences:** what this commits us to, good and bad
```

---

## 2026-05-13 — Ochre eyebrows swapped to forest for WCAG contrast

**Context:** Phase 2 Lighthouse audit flagged contrast failures on eyebrow labels (e.g. "The Roster", "Watch") that used `text-ochre` (`#B8893B`) against cream `#ECE2C8` — ratio ~2.2:1, well below WCAG AA (4.5:1 for small text).

**Decision:** All eyebrow/label elements switched from `text-ochre` to `text-forest` (`#3F5A3A`), which gives 7.3:1 (WCAG AAA). Hover states (`hover:text-ochre`) and CTA buttons that use ochre on oxblood/ink are unaffected — hover states are exempt from contrast requirements.

**Alternatives considered:**
- _Darken ochre._ Rejected: breaks brand palette cohesion.
- _Use ink instead of forest._ Rejected: too heavy against cream, loses the green accent character.

**Consequences:** Ochre is now strictly a hover, badge, and CTA color. Do not use it as foreground text against cream.

---

## 2026-05-13 — Server component wrapper for pages that need both metadata and a client form

**Context:** Next.js cannot export `metadata` from a `"use client"` module. The contact page needed both — `metadata` for SEO, and an interactive form with `useActionState`.

**Decision:** `contact/page.tsx` is a Server Component that exports `metadata` and renders `<ContactForm />`. The form is extracted to `src/components/ContactForm.tsx` marked `"use client"`. This pattern applies to any page that needs both.

**Alternatives considered:**
- _Generate metadata in a separate route segment._ Rejected: overkill for a single page.
- _Move metadata to layout._ Rejected: would apply to all pages in the group.

**Consequences:** Any page with a client-interactive form must follow this split: server page exports metadata, client component owns state/effects.

---

## 2026-05-13 — sitemap.ts uses createServiceClient, not createClient

**Context:** `sitemap.ts` is a special Next.js route that runs at build time. `createClient()` from `@supabase/ssr` calls `cookies()` from `next/headers`, which requires a live request context. At build time there is no request, so `cookies()` throws.

**Decision:** `sitemap.ts` uses `createServiceClient()` (raw `supabase-js`, no cookie dependency) to fetch active artist and release slugs.

**Alternatives considered:**
- _Static slug list._ Rejected: would go stale immediately after any data change.

**Consequences:** `sitemap.ts` effectively runs with service-role access. All entities fetched there are already public (active artists, published releases), so no data leak risk.

---

## 2026-05-13 — Click-to-play VideoEmbed (no iframe on initial render)

**Context:** Embedding YouTube iframes directly causes each card to load YouTube's JS bundle on page load, significantly degrading Lighthouse performance scores and LCP, especially with 3–6 videos on a page.

**Decision:** `VideoEmbed` is a client component that initially renders the YouTube thumbnail (`img.youtube.com/vi/{id}/hqdefault.jpg`) with a play overlay. On click it replaces itself with the `<iframe>` with `autoplay=1`. YouTube scripts only load for videos the user actually wants to watch.

**Alternatives considered:**
- _`loading="lazy"` on iframes._ Rejected: still loads the iframe subtree and JS bundle for all iframes, just deferred.
- _`lite-youtube-embed` third-party package._ Rejected: adds a dependency for something we can implement in ~30 lines.

**Consequences:** Videos don't autoplay on page load. Thumbnails must be available at `img.youtube.com/vi/{id}/hqdefault.jpg` — this is standard for all YouTube videos.

---

## 2026-05-13 — URL-based filtering for Releases and Videos pages

**Context:** Releases and Videos pages support artist and type/kind filtering. The filter state needs to be bookmarkable, shareable, and compatible with SSR (so the Supabase query runs server-side with the filter applied).

**Decision:** Filter state lives in URL search params (`?artist=uuid&type=single`). The Server Component reads `searchParams` and passes them to the Supabase query. The filter UI (`ReleasesFilter`, `VideosFilter`) are client components that push URL changes via `useRouter`. They must be wrapped in `<Suspense>` because `useSearchParams()` requires it in Next.js App Router.

**Alternatives considered:**
- _Client-side filtering with `useState`._ Rejected: filtering happens in JS after full data load; no SSR benefit.
- _Server form with GET method._ Rejected: loses the ability to do pill-based multi-select without a full page reload.

**Consequences:** Filter components always need a `<Suspense fallback={null}>` wrapper. Adding new filter dimensions just means adding a new URL param and an extra `.eq()` on the query.

---

## 2026-05-13 — Client-side auth + proxy role check (not Server Action redirect)

**Context:** Next.js 16 + `@supabase/ssr` — cookies set via `cookies()` from `next/headers` inside a Server Action are not reliably forwarded when the action calls `redirect()`. The proxy received the subsequent request with no session, bouncing the user back to login indefinitely.

**Decision:** Sign-in happens client-side using `createBrowserClient` from `@supabase/ssr`. After login the browser navigates to `/admin` via `window.location.href`. The proxy (`src/proxy.ts`) reads the session from request cookies using `updateSession`, then checks the admin role using an inline `@supabase/supabase-js` service-role client (not imported from `server.ts`, which would pull `next/headers` into Edge Runtime). Non-admin authenticated users are redirected to `/portal` by the proxy.

**Alternatives considered:**
- _Server Action + `redirect()`_: broken in Next.js 16 for this cookie pattern.
- _Route Handler for sign-in_: would work but adds a roundtrip; client-side is simpler for a form flow.

**Consequences:**
- Login is a pure client component — no Server Action for auth. Fine for Phase 1.
- `createServiceClient` in `server.ts` now uses raw `supabase-js` (not `@supabase/ssr`) so it truly bypasses RLS regardless of session cookies.
- Proxy must not import from `src/lib/supabase/server.ts` (it imports `next/headers`).

---

## 2026-05-13 — Tailwind v4 CSS-first config (no tailwind.config.ts)

**Context:** `create-next-app` installed Tailwind v4, which dropped the JS config file in favour of CSS-first configuration via `@theme` blocks in `globals.css`.

**Decision:** Keep Tailwind v4 and define all brand tokens (`--color-oxblood`, `--color-cream`, etc.) in `@theme inline` inside `src/app/globals.css`. References in the codebase still use standard Tailwind utilities (`bg-oxblood`, `text-cream`) — nothing changes at the usage site.

**Alternatives considered:**
- _Downgrade to Tailwind v3_ to match the original plan's `tailwind.config.ts` example. Rejected: v4 is the current release and the CSS-first approach is simpler, not harder.

**Consequences:**
- `docs/brand.md` shows a `tailwind.config.ts` excerpt — that excerpt is illustrative only; the real source of truth is `globals.css`.
- Any future custom plugins or `theme.extend` patterns need to use v4 syntax.

---

## 2026-05-13 — Next.js 16 installed (plan said 15)

**Context:** `create-next-app` resolved to `next@16.2.6` when scaffolding on 2026-05-13. The original plan referenced Next.js 15.

**Decision:** Accept Next.js 16. App Router, Server Components, `@/` alias, and all other conventions are unchanged. Update references to "Next.js 15" in docs as they come up naturally — no mass find-replace needed.

**Alternatives considered:**
- _Pin to next@15._ Rejected: no known incompatibilities and we'd be immediately behind.

**Consequences:**
- None anticipated. If a 16→15 breaking change surfaces, log it here and adapt.

---

## 2026-05-XX — Initial stack: Next.js + Supabase + Vercel + Inngest

**Context:** Greenfield record label platform with public site, gated artist portal, and an automated video pipeline. Need a stack that handles auth, file storage, durable async workflows, and ships fast with a single developer using Claude Code.

**Decision:**
- **Next.js 15 on Vercel** for the app — App Router, Server Components, edge-friendly.
- **Supabase** for Postgres, Auth, Storage, and Row-Level Security in one platform.
- **Inngest** for the video automation pipeline — durable multi-step functions with retries and a built-in dashboard.
- **Resend** for transactional email.
- **GitHub** for source, with Vercel auto-deploy on push to `main`.

**Alternatives considered:**
- _Hostinger VPS + Express + Postgres + Paperclip AI._ Rejected: more infra to manage, no built-in auth/storage/RLS, and Paperclip is being dropped from the toolchain.
- _Firebase._ Rejected: weaker SQL story, less control over auth flows.
- _Custom Node worker on the existing VPS instead of Inngest._ Rejected: would have to build observability, retries, and step state ourselves. Inngest gives us all of that for free up to 50K monthly executions, which is more orchestration than we'll plausibly use.

**Consequences:**
- All long-running AI work goes through Inngest functions, not API route timeouts.
- File uploads route through Supabase Storage with signed URLs.
- Two environments to manage (local Supabase via Docker, hosted Supabase in prod).
- We pay nothing until real volume — Vercel hobby, Supabase free tier, Inngest free tier, Resend free tier all cover Phase 1–3 fully.

---

## 2026-05-XX — Two-theme visual system: cream public, ink portal

**Context:** Brand direction is roots/vintage Studio One homage. But the artist portal and any video-heavy pages need dark backgrounds so media pops. These are in tension.

**Decision:** Build two complementary themes. The public site is cream-dominant (`#ECE2C8` background, oxblood and forest inks, slab-serif headlines, subtle paper grain). The portal and video-rendering pages flip to ink-dark (`#1A1612` background, bone-white text, same oxblood and forest as accents). The logo works natively in both.

**Alternatives considered:**
- _Single cream theme everywhere._ Rejected: video thumbnails and waveforms look weak on cream.
- _Single ink theme everywhere._ Rejected: undersells the Jamaican roots/vintage identity the label wants.

**Consequences:**
- Theme switch is a CSS class on the root layout per route group, not a runtime toggle. No theme picker for users.
- All components must look correct in both themes from the start.
- Logo SVG needs two color variants (already designed).

---

## 2026-05-XX — Reusable QR signup code with admin approval gate

**Context:** Need a frictionless way to onboard signed artists without exposing the signup endpoint to anyone with the URL.

**Decision:** A single reusable signup code is generated in admin and embedded in a QR on a printed business card. Artists scan → fill an application form → account created in `pending` status → admin approves → portal access unlocks. The code is rotatable from admin without redeploying.

**Alternatives considered:**
- _Single-use per-artist tokens._ Rejected as too high-friction for the current 5-artist scale; can revisit if abuse happens.
- _Fully open signup._ Rejected: invites randoms.
- _Email-only invite._ Rejected: less memorable than a physical card the label can hand out at events.

**Consequences:**
- `signup_codes` table needed, with active/inactive state and rotation timestamp.
- Approval workflow lives in admin — Resend sends "application received" and "approved" emails.
- If the QR card gets posted publicly, admin rotates the code from the dashboard.
