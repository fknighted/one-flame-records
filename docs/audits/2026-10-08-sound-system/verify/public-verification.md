# Public site verification (independent), 2026-10-09

Verifier did not change source. Server: http://localhost:3107 (production build, .next BUILD_ID dated Oct 9 00:03; build not re-run).
Screenshots (full page, 375 and 1280): this folder, `<page>-375.png` / `<page>-1280.png` for home, artists, artist (kahlic), releases, videos, news, lounge, about, contact, sign, gamer, search, privacy, terms, nf (404). News has no stories and releases has none yet, so those show empty states.

## Phase 1 Rebuild public pages: CONFIRMED
- tsc --noEmit: pass (exit 0). eslint: 4 errors / 25 warnings (baseline 7 / ~27-31), none new in public routes.
- All 15 routes x 2 widths return 200 (404 route returns 404).
- Computed fonts on every page: only Archivo and Big Shoulders. grep of src for fraunces, Inter, font-serif, cream, bg-ink, font-display: no hits outside admin/portal/bar areas.
- Look checked by eye: black wall, yellow/red/paper blocks, speaker grille bands beside photos only, flame logo light on black/red, square corners (only round items: speaker rings), no gradients/shadows.
- Not checked: build re-run, email templates (out of scope per ledger).

## Phase 2 Automatic photo treatment: CONFIRMED (limited live proof)
- `src/components/PrintedPhoto.tsx` adds class print-yellow/print-red to a next/image; SVG filters in `PrintFilters.tsx` (mounted in public layout) map greyscale to black / block colour / paper (table: black, colour, colour, paper = medium). Used by home hero, ArtistCard, artist detail (2 places), news list, news story, search results.
- Rendered check: home hero image computed filter is url(#print-yellow); by eye it reads as black / yellow / white print, matches brand-book "middle strength".
- Original untouched: filter is applied at display time only; git status shows upload forms changed but diff is styling classes only, no upload/storage code. Release covers and video players are intentionally unprinted (brand book: cover art uncropped; ledger decision for video).
- Unverified: no artist or news photo exists in the data, so an actual uploaded artist/news photo was never rendered; proven by code path plus the home hero (a repo file) only. Red tone not seen in a browser.

## Phase 3 Accessibility: CONFIRMED with notes
- Text contrast (every visible text node vs nearest opaque background, 4.5 / 3 for 24px+ or bold 18.66px+): 0 failures on all pages and widths except one: giant decorative "K" watermark on artist detail (black at 20%, 1.35:1). It is aria-hidden decoration; a judgment call, but it is not reading text.
- Fields: all visible inputs/selects/textarea have a 2px border (18.2:1 vs paper) and a 3px solid focus outline (red 5.0:1 on paper, yellow 11.6:1 on black). Exception: hidden off-screen spam-trap field "website" on /contact and /gamer-signup (border 0, default outline); not reachable by sight.
- Overflow at 375: document scrollWidth equals clientWidth on every page. Elements past the edge are inside clipped or scroll containers (filter chip row on releases/videos is overflow-x auto; K watermark inside overflow hidden; off-screen honeypot).
- Not measured: placeholder text colour, text over images/video, hover states. Console errors are only missing local Vercel analytics scripts (404 on localhost).
