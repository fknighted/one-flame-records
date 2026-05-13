# Phase 2 — Public site

**Goal:** A real, finished public site at oneflamerecords.com. Anyone can land, learn what One Flame is, browse the roster, listen to releases via embedded streaming, and watch the videos. Cream-themed Studio One homage. Mobile-first.

**Estimated time:** 3 working days.

**Done when:** The site looks like the brand described in `docs/brand.md`, all data from Phase 1 renders correctly, page speed is good (Lighthouse ≥ 90 on all four scores), and you'd be proud to share the link.

---

## Task 1 — Public layout & theme system

**Do:**
- `src/app/(public)/layout.tsx` — cream background, grain texture overlay, font setup, header, footer.
- Header: flame mark (cream variant) on the left, nav links on the right (Artists · Releases · Videos · About · Contact). Mobile: hamburger that opens a full-screen overlay.
- Footer: per `docs/brand.md` § component recipes.
- Verify the ink-theme admin still works — adding the public layout shouldn't break `/admin`.

**Acceptance:**
- Header and footer render on every public route.
- Grain texture visible but subtle (around 6% opacity).
- Mobile nav works.
- Lighthouse mobile score ≥ 90.

---

## Task 2 — Homepage

**Do:**
- Hero: huge oxblood display headline (one strong sentence — "Pressed in Montego Bay since [year]" or similar), thin oxblood rule, sub-line in body type.
- Featured artists section: grid of `ArtistCard`s for artists where `featured_order` is set, ordered ascending.
- Latest releases: horizontal scroll on mobile, 3-column grid on desktop. Pull six most recent.
- Latest videos: featured video gets a hero embed, two more below.
- "Sign with One Flame" footer band — short copy, oxblood background, bone text, CTA button linking to /contact.

**Acceptance:**
- All sections render with real Phase 1 data.
- Page loads in under 2 seconds on a mid-range mobile (cached fonts).
- Embed thumbnails are lazy-loaded.

---

## Task 3 — Artists list & detail

**Do:**
- `/artists` — grid of `ArtistCard`s for all active artists, sorted by stage name unless a different sort makes sense.
- `/artists/[slug]` — hero with photo (the artist's image as the full-width header), stage name in display type, hometown and genres as caption. Bio rendered as Markdown. Releases by this artist as cards. Videos as embed grid. Streaming icons row.

**Acceptance:**
- Every active artist has a working detail page.
- 404 for a non-existent slug.
- Inactive artists are not reachable.
- Open Graph meta tags pull the artist's photo and bio for social previews.

---

## Task 4 — Releases list & detail

**Do:**
- `/releases` — grid of release cards, sorted by release_date desc, filterable by artist and type (single / EP / album / mixtape).
- `/releases/[slug]` — large cover image, title in display type, artist name as link, release date, type pill. Description if present. Streaming links as big tappable icon buttons. Linked video below if there is one.

**Acceptance:**
- All releases render.
- Streaming buttons go to the right URLs and open in a new tab.
- 404 for non-existent slug.

---

## Task 5 — Videos page

**Do:**
- `/videos` — grid of `VideoEmbed`s for all videos, sorted by published_at desc.
- Featured videos appear first.
- Filter by artist and by kind.
- Lazy-load all iframes — only the first 2-3 above the fold are loaded eagerly.

**Acceptance:**
- All videos play in place when clicked.
- Lighthouse score doesn't tank from too many embeds (lazy loading working).

---

## Task 6 — About page

**Do:**
- `/about` — long-form editorial layout. Story of the label, photos, key dates as a vertical timeline.
- Section on Sweet Dreams Villa if fk wants to cross-link (probably not — keep them separate for now).
- Section on the studio/services if relevant.

**Acceptance:**
- Reads like a record-sleeve back cover, not a corporate "about us."
- Mobile reading is comfortable (line length, font size).

---

## Task 7 — Contact page

**Do:**
- `/contact` — short form: name, email, reason (general / press / sync licensing / artist submission), message.
- Submit via Server Action that emails fk via Resend.
- Honeypot field for spam protection.
- Success state replaces the form with a thank-you message.

**Acceptance:**
- A real submission lands in fk's inbox.
- Spam honeypot catches bots that fill every field.

---

## Task 8 — SEO & metadata

**Do:**
- `generateMetadata` on every page returning title, description, OG image, Twitter card.
- Artist and release pages use their photo/cover as OG image.
- Default OG image for other pages: a branded card (oxblood background, flame mark, label name).
- `robots.txt` allowing all crawlers.
- `sitemap.xml` generated from the database (artists, releases, videos, static pages).
- Add JSON-LD structured data for `MusicGroup`, `MusicAlbum`, `MusicRecording` on the relevant detail pages.

**Acceptance:**
- Sharing any URL on WhatsApp / Twitter / Instagram pulls correct preview.
- `oneflamerecords.com/sitemap.xml` is valid.
- Google Search Console shows the site indexed within a week.

---

## Task 9 — Performance pass

**Do:**
- Audit with Lighthouse on three real pages (homepage, an artist detail, releases list).
- Optimize any image not served via `next/image`.
- Check that `next/font` is preloading correctly.
- Add `loading="lazy"` to YouTube iframes (or use a click-to-play wrapper).
- Verify Tailwind's `content` config is not bundling unused classes.

**Acceptance:**
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on all three audited pages.

---

## Phase 2 wrap-up

- Update `PROGRESS.md` → Phase 2 complete, Phase 3 next.
- `git tag phase-2-complete && git push --tags`.
- Share the live URL with the artists. They'll spot anything wrong in their bios faster than you will.
