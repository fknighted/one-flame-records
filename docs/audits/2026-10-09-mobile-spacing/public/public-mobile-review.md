# Public site mobile review (390x844), live www.oneflamerecords.com, 2026-10-09

Method: Playwright, full-page screenshots in this folder (one PNG per page, plus `home-menu-open.png`), every screenshot viewed section by section, plus a measurement script (raw output: `audit-raw.json`). Read-only; nothing edited or submitted. Brand rules: `design-system/brand-book.md` (phone gutter 16px, sections 56px top/bottom, control height 46px, labels 12-13px allowed).

Checked and clean on every page: no horizontal page overflow; no text closer than 16px to the edge (except intentional scroll rows); no distorted images; no headline overflowing its box; no real overlaps of text (speaker rings, grille band and sticky header all clear of text). Section padding is 56px top/bottom almost everywhere (matches the book). Body text is 16-17px; sub-14px text is only labels/captions (12-13px, allowed).

Pages not in the list but covered: `/artists/bawlinz-...` (second artist), `/signup`, `/subscribe` were not visited. Legal pages (`/privacy`, `/terms`) viewed at top, middle and end.

## Site-wide (appears on every page)

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Footer text links are 14px tall (About, Sign with us, Contact, Artists, Releases, Videos, Privacy, Terms; widths 36-72px). Rows are 34px apart so taps are easy to miss. | Footer link lists, `src/components/PublicFooter.tsx` (`LINK` const, line 23) | medium | `LINK`: add `inline-flex items-center min-h-[44px]` (or `py-3`), drop the per-item gap in `LinkList` to match. |
| Header Menu/Close button is 73x40 and the logo link is 89x40, under 44px (brand book control height is 46). | `src/components/PublicHeader.tsx` line 59 | medium | `min-h-[40px]` -> `min-h-[46px]`; logo link add `min-h-[44px]`. Header grows from 68px to about 74px, so check the sticky `top-[76px]` filter bars on desktop. |
| Footer social icons are 44x44 boxes but the glyph is centred, so it looks indented to x=38 while all text sits at x=16. | `PublicFooter.tsx` lines 82-101 | low | Add `-ml-3` to the icon row wrapper so the glyphs align with the 16px gutter (box stays 44px). Same pattern on `/flames-lounge` "Come through" block. |
| Footer is about 640px tall on a phone (logo, two link columns, Legal on its own row, copyright, icons). | `PublicFooter.tsx` line 62 | low | `grid-cols-2` -> put Legal links under Label in the same column or use `grid-cols-3` with `gap-x-4` so Legal sits beside Music; saves about 100px. |
| Newsletter block ("Stay in the loop") on paper sits straight after paper content on About, Privacy, Terms and the home page with only a 4px rule or none, so the two blocks read as one long section with a doubled gap (about 110px). | `src/components/` newsletter wrapper used by layout; legal pages `src/app/(public)/privacy/page.tsx`, `terms/page.tsx` | low | Give the newsletter block a `border-t-4 border-black` (already used on home) on every page, and trim the page's own bottom padding to `pb-10`. |

## / (home) and phone menu

| Problem | Where | Severity | Fix |
|---|---|---|---|
| "All artists" and "All videos" links are 14px tall. | `src/components/SectionHeader.tsx`, used in `src/app/(public)/page.tsx` lines 125, 153 | medium | Add `inline-flex min-h-[44px] items-center` to the action link class. |
| Nine artists in a two-column grid leave one orphan tile (V) with an empty cell beside it. | Roster grid, `src/app/(public)/page.tsx` ~line 130; `artists/page.tsx` line 42 | low | Cosmetic. Either fill the empty cell with an "All artists" tile or let the last tile span two columns: `last:odd:col-span-2` on the tile wrapper. |
| Roster and Latest videos are both black sections stacked, so the gap between the last tile and the next heading is about 112px (56 + 56) versus 56px elsewhere. | `page.tsx` lines 124 and 152 | low | On the second of two same-colour sections use `pt-0 sm:pt-0` or `-mt-14` so the join is 56px; or give the videos section a `border-t-4 border-line` rule. |
| Hero: main button and the following grille band are well separated but hero top (75px incl. header) and bottom (99px) are uneven; the hero buttons show a thin light strip on their right edge (2px yellow outline of the second button against yellow). | `page.tsx` line 95 (`pt-10 pb-[82px]`) | low | `pb-[82px]` -> `pb-14` on phones (the grille band already adds space). For the strip, check the outlined-button border is drawn on all four sides (`border-2 border-yellow` plus `box-border`). |
| Phone menu opens as a push-down panel: rows are 50px tall and full width (good), page content below is pushed rather than covered. | `PublicHeader.tsx` | low | No fix needed. Optional: `fixed inset-x-0` with `max-h-[calc(100dvh-68px)] overflow-y-auto` if you want it to overlay. |

## /artists

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Orphan last tile (9 artists, two columns), same as home. | `src/app/(public)/artists/page.tsx` line 42 | low | `last:odd:col-span-2` on the card wrapper. |
| Caption lines (12px, "Signed to One Flame") on 8px-gap tiles: legal for captions, tight against tile edge at 12px inset. | `src/components/ArtistCard.tsx` line 58 | low | Leave, or `type-caption` -> `type-small` (13px) for readability on the dark-brown tiles. |

## /artists/fola-boss (and the second artist, bawlinz; same layout)

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Hero name, tags and Follow block sit at x=22-26px while the rest of the site uses 16px. Inconsistent gutter. | `src/app/(public)/artists/[slug]/page.tsx` line 257 (`p-[22px]`) and the hero name block | medium | `p-[22px]` -> `px-4 py-[22px]`, and give the hero name wrapper `px-4`, so everything lines up on 16px. |
| Artists without a photo get a 220px empty red block above the name (the big clipped initial is the only content). Reads as a broken image. | Artist hero, same file, hero grid | medium | `min-h-[220px]` on the red panel for the no-photo case (`min-h-[160px]`), and make the clipped initial a little larger or fully visible. |
| "Follow" label sits above a single Instagram link with a 24px gap and the link is only 14px tall. | line 305-320 | low | `mb-3` -> `mb-1`, link `inline-flex min-h-[44px] items-center`. |
| Black strip holding only "All artists" is 156px tall (56 + 44 + 56): large empty band. | line 325 and 460-466 | low | Wrapper `py-14` -> `py-8` on phones: `py-8 sm:py-[88px]`. |
| Giant initial letter is clipped at the right edge and runs under the header corner. Verified visually fine; the script reports an "overlap" with the Menu button because the box extends under the sticky header. | hero decorative `span.absolute.-right-5.-top-[30px]` | low | None needed; add `pointer-events-none` and `aria-hidden` if not already set. |

## /releases and /videos

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Filter chips scroll sideways and are cut off at the screen edge with no fade ("MIXTA" on releases, "MUSIC VIDEO" on videos). The Newest/Oldest/A-Z sort buttons sit 230px or more off screen, so most people will never see them. | `src/components/ReleasesFilter.tsx` line 53, `VideosFilter.tsx` line 52 | medium | Wrap chips on phones: replace `overflow-x-auto ... sm:flex-wrap` with `flex-wrap gap-2` at all sizes (chips are 44px tall, two rows fit). Or put sort in a `<select>` like the artist filter on /videos. |
| "0 releases" counter is 13px muted text bottom-aligned to the headline; acceptable, but sits far from the headline. | `releases/page.tsx` header row | low | `items-end` -> `items-baseline`. |
| Empty-state box on /releases and /news: 79px padding above and below the dashed box (black section 56px + wrapper). | `src/components/EmptyState.tsx` usage | low | Section `py-14` -> `py-10` when the content is only an empty state. |
| Native video controls show a play bar over the poster; video card has 56px dead space below the title before the newsletter. Fine. | `src/components/VideoEmbed.tsx` | low | None. |

## /news, /search?q=kahlic

| Problem | Where | Severity | Fix |
|---|---|---|---|
| /news: empty state only (same 79px padding issue as /releases). | `src/app/(public)/news/page.tsx` | low | As above. |
| /search: search button 110x44 and field align well. The first section header (SEARCH) to form gap is 24px; results heading follows with 28px gap, even. No problems found. | `src/app/(public)/search/page.tsx` | low | None. |

## /flames-lounge (6585px tall, longest page)

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Two-line headlines break with a one-word orphan ("OPEN / SKIES.", "MADE / FRESH.", "MEETS THE / MOMENT.") at 36px/32px with 0.85 leading. Legible but loose. | `src/app/(public)/flames-lounge/page.tsx` headings in sections at lines 267-338 | low | Add `text-balance` to the headline class (`type-headline` / `type-title`) so the lines split evenly. |
| Stacked black sections (Where the music meets the moment, Jamaican flavour, Events, The space) double the padding to about 110px between blocks. | lines 243, 267, 302, 338, 399 | low | Give alternate sections a `border-t-4 border-line` (line 338 already does) and use `pt-10` on phones for the one after another black section. |
| "Visit the label" inline link wraps onto two lines and is 19px tall; Follow @flamesmobay link is 14px tall. | text links in the hero and intro | low | `inline-block py-2` (or `min-h-[44px] inline-flex items-center`). |
| Speaker rings block (red, 265px) is clear of text: no overlap. Social icons in "Come through" sit at x=38 vs 16 gutter. | `flames-lounge/page.tsx` line ~410 | low | Same `-ml-3` fix as the footer icons. |
| Yellow "A full studio" section ends with a 56px gap under the red flame panel, 130px visual gap from the last paragraph because of the 220px flame box. | line 283 | low | Reduce flame panel to `h-[160px] sm:h-auto`. |

## /about

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Hero lead paragraph is 18px/semibold over 6 lines, good. Long article body on paper uses 17px/1.6; spacing consistent. Hairline above the newsletter is 1px grey, not the 3-4px black rule used elsewhere. | `src/app/(public)/about/page.tsx` | low | Use `border-t-4 border-black` for the divider before the newsletter. |

## /contact

| Problem | Where | Severity | Fix |
|---|---|---|---|
| None found. Form fields are 46px tall, paper on black, labels 14px, 20px inner padding; select arrow is flush to the right edge but inside the field. A hidden 1x1 honeypot input is reported by the tap-target check and is expected. | `src/components/ContactForm.tsx` | n/a | None. |

## /sign

| Problem | Where | Severity | Fix |
|---|---|---|---|
| "Our roster" link under the primary button is 98x16 (tap target). | `src/app/(public)/sign/page.tsx` hero | medium | `inline-flex min-h-[44px] items-center`. |
| Small eyebrow ("MONTEGO BAY, JAMAICA") sits only 4px above the "Ready to talk?" headline. | red CTA block near the end | low | `mb-1` -> `mb-3` on the eyebrow. |
| Hero headline is 56px, 4 words, wraps to two lines with orphan "FLAME." and very tight leading; nothing broken. | hero | low | `text-balance`. |

## /privacy and /terms

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Section headings (`type-title`, 32px) have only about 4-6px before their paragraph versus about 40px above, so headings look glued to the text below. | `src/app/(public)/privacy/page.tsx` lines 28, 46, 75 (`mb-3`) and the same in `terms/page.tsx` | low | `mb-3` -> `mb-4`, and increase space above each section to `mt-10`. |
| Inline email links are 19px tall; "Back to home" is 14px tall. | both pages | low | `inline-block py-2` / `min-h-[44px] inline-flex items-center`. |
| Newsletter block directly after the paper article without a divider (see site-wide). | end of page | low | See site-wide. |

## /unsubscribe

| Problem | Where | Severity | Fix |
|---|---|---|---|
| Invalid-link card has no page headline above it; the white card on black starts 76px under the header and is the only content, so the page feels unbranded. Card gutter 16px: fine. | `src/app/(public)/unsubscribe/page.tsx` | low | Optional: add the standard black hero strip (label + headline) like /privacy. |

## 404

| Problem | Where | Severity | Fix |
|---|---|---|---|
| The 404 page has no site header or footer, so on a phone the only way out is the two buttons. Centered layout is clean (logo, label, headline, copy, two 46px buttons, even spacing). | `src/app/not-found.tsx` (outside the `(public)` layout) | medium | Render it under the public layout (move to `src/app/(public)/not-found.tsx` or wrap in `PublicHeader`/`PublicFooter`). |
| Large empty black space under the buttons (vertical centering on `min-h-screen`). | line 8 | low | Fine as is. |

## Ranked summary

1. Tap targets under 44px: footer links (14px), header Menu/logo (40px), section-header links "All artists/All videos" (14px), "Our roster" on /sign, inline links on legal and Lounge pages. Medium, affects every page.
2. Releases/videos filter rows scroll sideways and hide the sort buttons off screen. Medium.
3. Artist pages: gutter of 22-26px instead of 16px, and a 220px blank red hero when there is no photo. Medium.
4. 404 page has no site navigation. Medium.
5. Stacked same-colour sections double the padding (about 110px); legal headings glued to paragraphs; one-word orphans in two-line headlines; footer icons indented. Low polish.

No high-severity issues found: nothing overflows, nothing is unreadable, nothing is untappable.
