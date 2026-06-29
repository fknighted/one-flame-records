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

## 2026-06-22 — Atomic Postgres RPCs for bar stock and tab total

**Context:** `addItemToTab` had a TOCTOU race: two concurrent requests could both read `stock_quantity > 0`, both insert a tab item, then both attempt the decrement — but only the first decrement fires (the second is blocked by `.gt("stock_quantity", 0)`). Result: two items added, one unit decremented. The tab total had the same race: both requests read the same `total_cents`, both write `total + price`, net effect is one price added instead of two.

**Decision:** Three `SECURITY DEFINER` Postgres functions in migration `20260622000001`:
- `decrement_pos_item_stock(p_item_id)` — `UPDATE … WHERE stock_quantity > 0`, returns `boolean` (false = raced to zero)
- `increment_tab_total(p_tab_id, p_amount)` — `SET total_cents = total_cents + p_amount`
- `decrement_tab_total(p_tab_id, p_amount)` — `SET total_cents = GREATEST(0, total_cents - p_amount)`

`addItemToTab` now: inserts tab item (capturing ID), calls `decrement_pos_item_stock`, deletes the insert and returns error if it returns false, then calls `increment_tab_total`. The SQL arithmetic in all three functions makes them atomic single-statement updates — no read-modify-write at the application layer.

**Alternatives considered:**
- _Full transaction wrapping insert + decrement in a single PG function._ Rejected as over-engineering for current traffic levels; the rollback-on-false pattern achieves correctness with less migration surface area.
- _Application-layer retry._ Rejected — retrying a failed insert-then-decrement is complex and still racy.

**Consequences:** Tab total and stock quantity are now correct under concurrent adds and removes. The insert→decrement gap is still two separate DB calls (not a true serializable transaction), but the atomic decrement ensures only one caller gets the last unit. Future migration could collapse the whole flow into a single PG function if higher throughput demands it.

---

## 2026-06-28 — Cultural authenticity directive in Claude video system prompt

**Context:** One Flame Records artists are Black Jamaicans. Without an explicit instruction, AI video generation models and Claude's scene-prompting layer default to racially ambiguous or even non-Black subjects, which misrepresents the label, its artists, and their community.

**Decision:** Added a mandatory cultural authenticity block at the top of `buildSystemPrompt()` in `src/lib/video/prompt-scenes.ts`. It declares: all human subjects must be Black Jamaican across the full spectrum of Black skin tones; no white, Caucasian, East Asian, South Asian, or non-Black subjects; clothing/hairstyles/settings must be authentically Jamaican. This sits in the system prompt so it applies universally to every style preset and every video job — no per-request action required.

**Alternatives considered:**
- _Per-style string addition._ Rejected — the directive is not style-specific; it would have to be duplicated into every one of 16 presets and any future presets added.
- _Creative brief field._ Rejected — relies on the user remembering to type it; system-prompt placement makes it automatic and non-negotiable.

**Consequences:** Every AI-generated scene description from this point forward will reflect Black Jamaican subjects. If a future style genuinely calls for non-human or abstract subjects (e.g. "Abstract visualizer"), the style-specific hint already in the system prompt handles the exception cleanly without weakening the general rule.

---

## 2026-05-27 — Public assets use server-side signed URLs, not a public bucket

**Context:** Artist assets (instrumentals, demos, reference images) live in the `private-assets` bucket with no public access. When `is_public = true` we want them visible on the public artist page without moving them to a public bucket or changing their storage path.

**Decision:** The artist detail Server Component calls `createServiceClient()` at render time and generates fresh 1-hour signed URLs for every public asset. These are rendered into `<img>`, `<audio>`, and download `<a>` tags. The bucket stays private; the signed URL is the access mechanism.

**Alternatives considered:**
- _Copy to `public-media` on publish._ Rejected: requires a copy operation on every toggle and leaves orphan files if the artist unpublishes.
- _Add a public policy to `private-assets`._ Rejected: would expose all assets, not just flagged ones.

**Consequences:** Every page load of the artist detail page calls Supabase Storage once per public asset. For a typical artist with <20 public assets this is trivially fast. If an artist accumulates 100+ public assets we can cache the signed URLs in the DB for a few hours.

---

## 2026-05-27 — Inngest polling: 5-min initial sleep + 50×30s (not tight loop)

**Context:** Initial Kling clip polling used 80×15s intervals (160 steps/clip). For a 15-clip job this approached the Inngest free-tier step limit (~1000/run) and caused "Clip 10 timed out" errors.

**Decision:** Restructured to: `step.sleep("initial", "5m")` then a loop of up to 50 `step.run` + `step.sleep("gap", "30s")` cycles. A typical clip completes in 5–12 minutes total. This reduces step count from ~160/clip to ~12–20/clip in the typical case, and caps the worst case at 30 minutes per clip.

**Alternatives considered:**
- _Longer initial sleep only._ Rejected: clips still sometimes run long, so we need the polling loop.
- _Webhook callback instead of polling._ Rejected: Kling API doesn't offer webhooks.

**Consequences:** Pipeline can handle 15-clip jobs within Inngest's step budget. If clip generation consistently takes > 30 minutes (not expected), increase the loop bound or initial sleep.

---

## 2026-05-27 — 24h signed URL TTL for pipeline-internal audio/image URLs

**Context:** The Inngest pipeline signs audio and reference image URLs at job start and passes them to Kling clip generation. Pipeline runs for 15 clips × up to 30 min each = potentially 2+ hours. With a 1h TTL the URL expired mid-job, causing "Download failed (400)" errors on clips 10–15.

**Decision:** All URLs generated for pipeline-internal use (audio file, reference images) use a 24-hour TTL: `.createSignedUrl(path, 86400)`. Portal download links shown to artists still use 1h.

**Alternatives considered:**
- _Re-sign on each clip attempt._ Rejected: adds complexity and requires storing the path in job params (it is stored, but re-signing in a loop step increases coupling).
- _Move audio to a public bucket temporarily._ Rejected: demos and instrumentals are private by design.

**Consequences:** A signed URL with 24h TTL is valid for the full pipeline window with headroom. If a job is abandoned the URL expires naturally.

---

## 2026-05-27 — `marked` (not `@tailwindcss/typography` prose) for news post rendering

**Context:** News post bodies are stored as Markdown. The public post detail page needs to render them as HTML.

**Decision:** Install `marked` (v18, zero-config) to convert Markdown → HTML at render time in the Server Component. Inline Tailwind utility classes on the prose container handle all styling (headings, links, lists, blockquotes, code, hr). No `@tailwindcss/typography` plugin installed.

**Alternatives considered:**
- _`@tailwindcss/typography` + `prose` class._ Rejected: requires a Tailwind plugin that doesn't exist in v4 CSS-first form yet.
- _`react-markdown`._ Rejected: adds a client component boundary and heavier bundle.
- _Store HTML in DB._ Rejected: harder to edit, XSS risk.

**Consequences:** Markdown rendered server-side via `dangerouslySetInnerHTML` — safe because only admin-authored content reaches the DB (no user-submitted bodies). Styling is maintained via explicit Tailwind selector utilities on the wrapper div.

---

## 2026-05-14 — Auth callback must be a Client Component (not a Route Handler)

**Context:** `resendInvite` uses `supabase.auth.admin.generateLink({ type: 'recovery' })` to generate a portal invite link without triggering Supabase's email rate limits. When the user opens this link, Supabase processes the OTP server-side and redirects to `/auth/callback`. The redirect uses implicit flow (hash fragment: `#access_token=...&refresh_token=...`), not PKCE (`?code=`). Hash fragments are stripped by the browser before the request reaches the server, so a Route Handler at `/auth/callback` never sees the tokens — it always falls through to the error redirect.

**Decision:** Replace `src/app/auth/callback/route.ts` with a Client Component page (`src/app/auth/callback/page.tsx`). On mount it checks for both flows: `?code=` (PKCE — calls `exchangeCodeForSession`) and `#access_token=` (implicit — calls `setSession`). Uses `createBrowserClient` so session cookies are written client-side and picked up by the middleware on subsequent navigation.

**Alternatives considered:**
- _Keep Route Handler, disable PKCE in Supabase dashboard._ Would still require client-side hash handling since the Route Handler can never see hash fragments regardless of PKCE setting.
- _Switch from `generateLink` back to `inviteUserByEmail`._ Rejected: hits Supabase rate limits on resend and fails for existing users.

**Consequences:** The callback page shows a brief "Signing you in…" flash while JS runs. Any future auth callback flows (OAuth, magic link) should also be handled here by checking the appropriate URL parameter or hash key.

---

## 2026-05-13 — Separate PortalProfileForm (not ArtistForm) for portal self-edit

**Context:** Artists can only edit `bio`, `photo_url`, `socials`, and `streaming` — not `stage_name`, `slug`, `genres`, or `status`. `ArtistForm` (admin component) owns all fields and has slug auto-generation logic tied to stage name input.

**Decision:** Build a dedicated `PortalProfileForm` client component that renders the editable fields only and displays the read-only fields as locked inputs with a "contact the label" note. The `updateProfile` server action resolves `artist_id` from the session rather than a hidden form input, and uses `createClient()` (session-scoped) for the DB update so `artists_update_self` RLS enforces the scope at the database level. Service client is used only for the Storage upload (unavoidable server-side need). On success the action returns `{ success: true }` instead of calling `redirect()`, so the artist stays on the page and sees a timed "Saved." confirmation.

**Alternatives considered:**
- _Adapt ArtistForm with conditional props._ Rejected: adds branching complexity to a shared component; portal restrictions would be easy to accidentally remove.
- _Redirect to `/portal` on save._ Rejected: navigating away on every save is annoying for iterative editing.

**Consequences:** Admin edit path and portal self-edit path are fully independent. Any future changes to portal-editable fields only touch `PortalProfileForm` and `updateProfile`.

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

## 2026-06-05 — gpt-image-1 replaces dall-e-3 for image generation

**Context:** The DALL-E 3 model (`dall-e-3`) returned "model does not exist" errors for the user's OpenAI subscription despite being a paid account. OpenAI deprecated direct DALL-E 3 access for most accounts in 2025.

**Decision:** Switch to `gpt-image-1`, the current OpenAI image generation model. It uses the same `openai.images.generate()` call but returns base64 data directly (no temporary URL to fetch), simplifying the code. For reference-image generation, `openai.images.edit()` accepts a `File` object alongside the prompt.

**Alternatives considered:**
- _Replicate/fal.ai_ — would work but adds a new vendor for a feature already covered by the existing OpenAI subscription.

**Consequences:** `quality: "high"` and sizes `1024x1024`, `1536x1024`, `1024x1536` replace DALL-E 3's `quality: "hd"` and `1024x1024`, `1792x1024`, `1024x1792`. All SDK clients initialized lazily inside functions, not at module level, to prevent build-time failures when env vars are absent.

---

## 2026-06-05 — requireAdmin() for defense-in-depth on server actions

**Context:** Next.js middleware (`src/proxy.ts`) checks admin role before rendering `/admin/*` pages, but server actions can be called directly via HTTP POST from any authenticated session. Using `createServiceClient()` (service role key) inside actions bypasses RLS entirely, so a non-admin authenticated user who discovers an action endpoint could make arbitrary DB writes.

**Decision:** Add `src/lib/auth.ts` with a `requireAdmin()` async helper that reads the session via `createClient()`, checks `profiles.role === 'admin'`, and throws on failure. Called at the top of every server action that modifies data or calls external APIs. This is defense-in-depth — the middleware remains the primary gate.

**Alternatives considered:**
- _Rely on RLS only_ — rejected because actions use service client which bypasses RLS.
- _Move all mutations behind API routes with explicit auth_ — more correct but significantly more boilerplate for every action; the helper achieves the same protection with two lines.

**Consequences:** Every new admin server action must call `await requireAdmin()` first. Unauthenticated or non-admin callers get an unhandled throw that Next.js converts to a 500 — acceptable for an internal admin tool.

---

## 2026-06-05 — Content campaign pipeline via Inngest

**Context:** Generating 5–10 pieces of social content per campaign requires: Claude for planning + copy, gpt-image-1 for images, and potentially the video pipeline for clips. These are independent tasks that can run in parallel and each takes 5–30s. Running them serially in a single server action would hit the 60s Vercel function timeout.

**Decision:** The campaign pipeline is an Inngest function (`generate-campaign`) with the same step pattern as the video pipeline. `plan-content` calls Claude for a Zod-validated content plan; `generate-pieces` runs one `step.run` per piece in parallel. The function tolerates partial failure — pieces that error are marked `failed`, others proceed to `ready`.

**Consequences:** Campaign creation fires an Inngest event and returns immediately. The admin campaign detail page shows live progress and must be refreshed manually (no websocket push yet). Retry on individual pieces is supported via `regeneratePiece()`.

---

## 2026-06-05 — Prompt injection mitigation: XML delimiters around user content

**Context:** User-supplied `source_content` is passed into Claude prompts to generate captions and video scripts. A malicious or careless input like "Ignore all previous instructions…" could hijack the model's output.

**Decision:** Wrap all user-supplied text in `<source>...</source>` XML delimiters in every Claude prompt. Claude treats tagged content as data rather than instructions, significantly reducing prompt injection risk. This is consistent with Anthropic's recommended mitigation pattern.

**Consequences:** Prompts are slightly longer. Residual risk remains (a sufficiently crafted payload can still influence output) — acceptable for an admin-only tool where all users are trusted label staff.

---

## 2026-06-05 — Flames Lounge as a distinct sub-brand on the same domain

**Context:** The Flames Lounge is a physical venue connected to One Flame Records but serves a broader audience (walk-in public, event attendees, not just music fans). It needs its own page with its own atmosphere, but the label wanted it under oneflamerecords.com, not a separate domain.

**Decision:** Single route `/flames-lounge` on the main site, using the same Fraunces/Inter fonts and oxblood/ochre colour tokens but with a distinct dark palette (`#0A0806`, `#111009`, `#0D0B09`) that's richer and more atmospheric than the label's standard ink (`#1A1612`). The page sits in the `(public)` route group and is linked from the main header.

**Alternatives considered:**
- _Separate domain (flamesmobay.com)_ — rejected by user, wanted everything under one roof.
- _Match the label's exact ink theme_ — rejected; the lounge needs to feel like its own destination.

**Consequences:** The public header now has 7 nav items. If the nav becomes crowded on mobile, consider grouping or a mega-menu later.

---

## 2026-06-06 — Social posting via Make.com webhook, not direct platform APIs

**Context:** Direct Meta Graph API and TikTok Content Posting API integrations required complex developer app setup (Facebook page token flow took multiple sessions), and TikTok API access requires weeks of review. Make.com has native platform modules and handles OAuth internally.

**Decision:** All social posting (Instagram, Facebook, TikTok) fires a single JSON webhook to Make.com (`SOCIAL_WEBHOOK_URL`). Payload includes `{ platform, piece_id, content_type, caption, image_url, video_url }`. Make.com's Router module branches on `platform`. TikTok is manual for now — no Make.com video upload module exists; Publer is the best option if automation is later needed.

**Alternatives considered:**
- _Keep direct Meta API._ Rejected: Facebook page token flow is brittle (tokens need periodic refresh, app secret exposure in chat). Make.com abstracts this.
- _Zapier instead of Make.com._ Not evaluated — user already uses Make.com for other business ops.
- _Publer for all platforms._ Considered but Make.com is already in use; can switch later.

**Consequences:** Social posting depends on Make.com remaining connected and the scenario being active. The app has no visibility into whether a post actually succeeded — fire-and-forget. If observability is needed later, Make.com can call a webhook back.

---

## 2026-06-06 — Campaign pieces store news articles in caption + video_script columns

**Context:** `content_pieces` table was designed for social posts. Adding news post generation to the campaign pipeline needed a place to store an article title and body without a schema migration.

**Decision:** For `platform = "news"` pieces, repurpose existing columns: `caption` holds the article headline, `video_script` holds the full markdown body. When the piece is approved and published, a `news_posts` draft is created from these two fields. The piece's `platform` and `content_type` columns were extended with new CHECK constraint values (`news`, `news_post`).

**Alternatives considered:**
- _New columns on `content_pieces`_ (`article_title`, `article_body`). Rejected: requires a migration and these fields are semantically close to `caption`/`video_script`.
- _Separate `campaign_articles` table._ Rejected: overkill for Phase 5; the campaign review UI already handles pieces uniformly.

**Consequences:** `video_script` has a dual purpose — video scripts for social pieces, article body for news pieces. Differentiate by checking `piece.platform === "news"` in UI and publish logic.

---

## 2026-06-06 — Null published_at treated as immediately visible for news posts

**Context:** Campaign-generated news posts and manually created drafts that are published without a schedule date have `published_at = NULL`. The original RLS policy required `published_at <= now()` which excluded these posts even when `is_published = true`.

**Decision:** Public news queries use `.or("published_at.is.null,published_at.lte.${now}")` alongside `.eq("is_published", true)`. A null publish date means "show as soon as published". A future date can still be used to schedule visibility.

**Alternatives considered:**
- _Auto-set `published_at = now()` on publish._ Would work but requires the edit action to intercept and set it. The current approach is more forgiving.
- _Remove `published_at` filter entirely._ Rejected: would break future scheduling use case.

**Consequences:** Posts with `is_published = true` and `published_at = NULL` are visible immediately. Scheduled posts with a future `published_at` stay hidden until that time. App-level filters are now the primary gate — RLS is a backup, not the sole defence (admin session bypasses the public RLS policy).

---

## 2026-06-17 — Bar POS: single roleHome() helper in proxy for all role-to-route mapping

**Context:** Adding `bartender` and `gamer` roles means the proxy needs to protect four route groups (`/admin`, `/portal`, `/bar`, `/gamer`) with different role permissions, and redirect each role to its correct home when they land on the wrong route.

**Decision:** A single `roleHome(role: string | undefined): string` function in `src/proxy.ts` maps every role to its canonical home. All redirect logic in the proxy calls `roleHome()` rather than hardcoding a path. Route protection checks are explicit: `/admin` → admin only; `/portal` → artist only; `/bar` → admin + bartender; `/gamer` → gamer + admin.

**Alternatives considered:**
- _Per-route guard functions._ Rejected: duplicate logic and easy to forget a role when adding new ones.
- _Metadata on the route group layout._ Rejected: layouts don't run until the route is matched; the proxy needs to redirect before rendering.

**Consequences:** Adding a new role in future only requires: (1) add to the `profiles_role_check` constraint, (2) add a case in `roleHome()`, (3) add a route group + protection block in the proxy. Nothing else in auth needs to change.

---

## 2026-06-17 — is_bar_staff() as SECURITY DEFINER helper, mirroring is_admin()

**Context:** RLS policies on POS tables need to allow both `admin` and `bartender` roles. Without a helper, every policy would need to embed a subquery against `public.profiles` directly.

**Decision:** `is_bar_staff()` is a SECURITY DEFINER function (like the existing `is_admin()`) that returns true when `auth.uid()` has role `admin` or `bartender` in `public.profiles`. Used in all POS table policies.

**Alternatives considered:**
- _Inline subquery in each policy._ Works but is verbose, harder to change, and slower per query evaluation.
- _`is_admin()` covers bartender too._ Rejected: conflates two distinct roles with different access scope.

**Consequences:** Changing what "bar staff" means (e.g. adding a new role) requires updating one function instead of every POS table policy.

---

## 2026-06-21 — is_bartender boolean flag for artist dual-access (portal + bar)

**Context:** A One Flame artist who also works the bar needs both `/portal` (artist) and `/bar` (bartender) access simultaneously. The existing `profiles.role` column is single-valued — setting `role = 'bartender'` would remove portal access.

**Decision:** Add `is_bartender BOOLEAN DEFAULT FALSE` to `profiles`. The proxy checks `role === 'bartender' || is_bartender === true` for bar routes. `requireBarStaff()` does the same server-side. The artist's primary `role` stays `'artist'`, preserving portal access. Admins promote via `/admin/bar/staff` → "Promote Existing Artist" (email lookup + flag flip). Revoking just sets the flag back to `false` — the artist account is never banned.

**Alternatives considered:**
- _Change role to 'bartender' when on bar shift, revert after._ Rejected: requires manual toggling and loses portal access during the shift.
- _Junction table (`user_extra_roles`)._ Rejected: overkill for a single extra permission on a small user base; adds a join to every auth check.
- _Add 'artist-bartender' as a distinct role._ Rejected: proliferates roles unnecessarily and means duplicating all portal RLS policies for this composite role.

**Consequences:** `is_bar_staff()` Postgres function still returns true only for `role = 'bartender'` — it is not updated. Bar POS RLS policies enforce via the DB helper; the proxy and `requireBarStaff()` enforce at the app layer with the `is_bartender` flag. If RLS-level bar access for `is_bartender` users is ever needed (e.g. direct API access), the `is_bar_staff()` helper would need updating.

---

## 2026-06-21 — Jamaica midnight as 05:00 UTC for all "today" bar queries

**Context:** Vercel servers run in UTC. All "today" bar queries used `new Date().setHours(0,0,0,0)` (UTC midnight = 7pm Jamaica previous day) or `new Date(new Date().setHours(0,0,0,0)).toISOString()`. This caused tabs from the evening shift to be excluded from "today" and tabs from the morning to be double-counted.

**Decision:** `jamaicaMidnight(daysAgo = 0)` in `src/lib/bar/pos.ts` computes Jamaica midnight as 05:00 UTC (Jamaica is UTC-5 year-round, no DST). If the current UTC hour is < 5, we're still in Jamaica's previous calendar day, so the function subtracts one extra UTC day before setting `setUTCHours(5, 0, 0, 0)`. All time display uses `jamaicaTime()` / `jamaicaDateTime()` with `timeZone: 'America/Jamaica'`.

**Alternatives considered:**
- _Store times in Jamaica local time._ Rejected: Postgres/Supabase timestamps are always UTC; converting at write time is fragile across DST-aware regions.
- _`Intl.DateTimeFormat` to derive midnight._ More correct but more verbose; the UTC-5 offset is stable for Jamaica (no DST).

**Consequences:** All bar queries must use `jamaicaMidnight()` from the shared lib. Never use `new Date().setHours(0,0,0,0)` or `new Date().toISOString().slice(0, 10)` for bar date boundaries.

---

## 2026-06-17 — gamer_members row created at invite time, not on first login

**Context:** When a bartender (or admin) invites a gamer, they may want to pre-load the member's balance or add notes before the gamer has ever logged in. The Supabase invite flow creates the `auth.users` row immediately but the `profiles` trigger creates a bare `profiles` row — there is no `gamer_members` row until something creates it.

**Decision:** Both `inviteGamer` (bartender flow) and `gamerSignup` (public flow) call `supabase.from("gamer_members").insert(...)` immediately after `auth.admin.inviteUserByEmail` returns. The row exists as soon as the invite is sent.

**Alternatives considered:**
- _Create gamer_members on first portal login._ Rejected: bartender can't pre-load balance or see the member in the admin list until the gamer logs in.
- _Trigger on profiles insert._ Rejected: the `profiles` trigger fires for all roles; this would create spurious `gamer_members` rows for admins and artists.

**Consequences:** If an invite is sent but the gamer never completes signup, there will be a `gamer_members` row with `auth_user_id` pointing to a user who hasn't set a password. This is acceptable — the bartender can still see the row and it does no harm.

---

## 2026-06-23 — Unsubscribe link uses email-in-URL, no token

**Context:** The newsletter unsubscribe page at `/unsubscribe?email=x` uses the subscriber's email as the only identifier. Any caller who knows someone's email can unsubscribe them.

**Decision:** Accepted. This is the industry-standard pattern (Mailchimp, Substack, Resend etc. all use plain email links). The risk is narrow: unsubscribe links only appear in email footers sent to the subscriber, so only the subscriber (or someone with access to their inbox) can trigger the action. Adding a token would require an `unsubscribe_token` column, token generation at subscribe time, and token validation at click time — significant complexity for a small newsletter list.

**Alternatives considered:**
- _HMAC-signed token in the URL._ More secure but adds complexity. Revisit if the list grows large or if abuse is observed.

**Consequences:** `unsubscribeEmail` server action uses `createServiceClient()` (service role, bypasses RLS) since the RLS policy only allows public INSERT, not UPDATE. Document: if switching to user-auth-based unsubscribe in future, also add an RLS UPDATE policy.
