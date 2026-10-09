# Public site visual QA, 2026-10-08

Build: production, http://localhost:3107. Playwright (Chromium) rendered 375x812 and 1280x900 correctly. Screenshots: `screens/<page>-<width>.png` (32 files, plus `menu-open-375.png`). No source edited, no form submitted.

Automated checks run on every page at both widths: horizontal overflow, old palette colours (cream/bone/oxblood/ochre/forest/ink), Fraunces/Inter fonts, WCAG contrast, broken images.

Result across all pages: no page-level horizontal scroll, zero old-palette colours, zero Fraunces/Inter (only Archivo and Big Shoulders in use), zero broken images, no gradients, no emoji, no glow.

Not available: no release detail page or news article exists (both lists are empty), so those were not tested. 404s in the browser console are only `/_vercel/insights` and `/_vercel/speed-insights` scripts, which only exist on Vercel (expected locally). `networkidle` never settled on many pages within 20 s (likely video preload); pages still rendered fully.

## Findings by page

### / (home)
| Issue | File | Severity |
|---|---|---|
| Latest Videos shows one small card at 1280; right two thirds empty, "ALL VIDEOS" link floats far from it. | home page / video grid | Low |
| Video uses the browser's native rounded control bar, off-brand. | video component | Low |

### /artists
| Issue | File | Severity |
|---|---|---|
| None blocking. Letter tiles, flat colours, all readable. Last row has one tile (9 artists) leaving a gap at 1280. No artist photos anywhere, only initials. | artists page | Low |

### /artists/kahlic
| Issue | File | Severity |
|---|---|---|
| At 1280 the hero is split: red half on the left, tag chips sit in the cream strip to the right of it. It looks like a layout break (big empty cream area), not a deliberate design. At 375 it stacks fine. | `app/(public)/artists/[slug]/page.tsx` | Medium |
| Giant "K" watermark: contrast 1.35 (decorative), and at 375 it extends past the right edge (right=395) but is clipped, no scroll. Acceptable if intentionally decorative; mark `aria-hidden`. | same file, `-right-5 -top-[30px]` span | Low |
| Audio player is the native grey rounded pill. On mobile it is cramped beside the long title and wraps the title. Off-brand (rounded, grey). | same file (`<audio>`) | Medium |

### /releases, /news
| Issue | File | Severity |
|---|---|---|
| Empty states are clear and on brand (dashed yellow box, CTA). Releases filter row wraps to 3 rows at 375 and takes a lot of height for an empty page; native select is cream with chevron. | releases page | Low |

### /videos
| Issue | File | Severity |
|---|---|---|
| Same native video chrome. Filter row stacks to 3 rows on mobile. Otherwise fine. | videos page | Low |

### /flames-lounge
| Issue | File | Severity |
|---|---|---|
| "The Space" is a placeholder ("Photos of the space are on the way"), and the "A full studio. Open skies." section shows a red box with a small flame instead of a picture. Reads as unfinished content. | `app/(public)/flames-lounge/page.tsx` | Medium |
| Hero at 375 has no red art panel (only appears at 1280). Fine, but page is very long on mobile (6988 px). | same | Low |
| Small outline icons (sun, gamepad, cup, star) are the only non-poster-style graphics; thin-line style differs from flat poster look. | same | Low |

### /about, /contact, /sign, /gamer-signup, /privacy, /terms, /unsubscribe
| Issue | File | Severity |
|---|---|---|
| Layout, type and colours correct; no overflow, no contrast failures. | n/a | None |
| /gamer-signup: name field auto-focused with red ring on load at 375 (looks like an error state). | gamer-signup page | Low |
| /unsubscribe without a token shows "Invalid unsubscribe link" (correct), but only a plain card with no way forward. | unsubscribe page | Low |

### /search?q=a
| Issue | File | Severity |
|---|---|---|
| Single-letter query returns nothing and shows no message (no "type at least 2 letters" or "no results"). Blank black gap below the box. `q=kahlic` works. | `app/(public)/search/page.tsx` | Medium |
| The clear (x) icon inside the field is the browser's default blue, the only blue on the site. | same | Low |

### /does-not-exist (404)
| Issue | File | Severity |
|---|---|---|
| On brand, centred, readable, correct 404 status. Header/footer absent (standalone), fine. | not-found | None |

### Mobile menu (checked extra)
Opens full-width black panel, Big Shoulders links, yellow Sign with us. Fine.

## Contrast
Only failure on any page: the decorative "K" watermark above. No real text fails 4.5:1 (or 3:1 for large text).

## Doc note
`/Users/frankknight/Claude OS/Projects/one flame app/CLAUDE.md` still lists the old palette (oxblood, forest, cream, Fraunces, Inter). The site no longer uses it; the file is stale.
