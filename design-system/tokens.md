# One Flame Records tokens

Generated from `tokens.json`. Edit the JSON, not this file.

## Color

| Token | Value | Usage |
| --- | --- | --- |
| `cream` | `#ece2c8` | The public site's page ground (bg-cream, set on body in globals.css and on the public layout). Feels like a printed record sleeve; the paper-grain overlay sits on it. Text on it: ink, oxblood, forest, ink-80 to ink-65. |
| `ink` | `#1a1612` | Two jobs. As a ground: the studio world (artist portal, admin, bar till, gamer portal), the public footer, the home hero and inner-page banners. As text: body copy on cream (13.9:1) and on bone (15.4:1), the label on ochre buttons (5.7:1), and the label of any oxblood or bone button once it hovers to ochre (5.7:1). Never pure black. |
| `bone` | `#f5edd8` | Two jobs. As text: headings and primary text on ink (15.4:1), on oxblood (7.3:1) and on forest (6.6:1). As a ground: form inputs on the public site and the light button on the oxblood band. Never pure white. |
| `oxblood` | `#8b2a1f` | The flame. Headlines and section titles on cream (6.7:1), the short rule under every section title, primary buttons with bone text (7.3:1), the closing 'Sign with One Flame' band, album pills, the footer's top border, and the 2px focus outline round every field on the public site (6.7:1 on cream, 7.3:1 on a bone field, 8.6:1 on a white one). Too dark as text or icons on ink (2.1:1) and on the lounge grounds (about 2.3:1); use rose there. The Lounge pillar icons and menu category labels moved to rose on 2026-10-05. |
| `forest` | `#3f5a3a` | The inner flame. Small uppercase eyebrows on cream (6.0:1), EP pills with bone text (6.6:1). FAILS on ink (2.3:1), on the lounge grounds (about 2.5:1) and over the hero photo. SectionHeader switched to sage on dark grounds on 2026-10-05, but forest is still used for the eyebrows of the home hero, the ink banners that open inner public pages (artists, releases, videos, news, sign, privacy, terms) and the Lounge sections; use sage on dark grounds in new work. |
| `ochre` | `#b8893b` | The call to action. Solid ochre buttons with ink text (5.7:1), single pills, 'new' badges, money figures and accent text on ink (5.7:1) and lounge grounds (6.1 to 6.4:1), link hover, and the 2px focus outline round every field on ink (5.7:1; 5.1:1 on a bone-5 card). FAILS as text on cream (2.4:1) — the public site uses it there only as a link hover colour; keep it off cream for anything that must be read. When a button hovers to ochre its text turns ink (5.7:1); bone text on ochre is only 2.7:1, so never leave it there. |
| `rose` | `#e0907f` | Oxblood lifted for dark grounds (globals.css). Error and 'scheduled'/'failed' text and links on ink (7.3:1). The Flames Lounge pillar icons (7.9:1 on lounge-deep) and menu category labels (7.7:1 on lounge-warm), written there as text-[#E0907F]. |
| `sage` | `#82a57a` | Forest lifted for dark grounds (globals.css). Success, 'live' and 'done' text on ink (6.5:1). The SectionHeader eyebrow when `dark` is set (6.5:1 on ink). The right eyebrow colour on any dark ground in new work. |
| `lounge-night` | `#0a0806` | Flames Lounge page only: the hero and the outdoor-studio band (bg-[#0A0806]). Darker than ink so the venue reads as night. The hero has no photo: it is this ground, a soft oxblood glow and a large flame mark at 14% opacity (hidden on phones). Text: bone (17:1), bone-50 (4.7:1), ochre (6.4:1); the hero lead in bone at 55% is at least 5.1:1, at the centre of the glow. |
| `lounge-deep` | `#0d0b09` | Flames Lounge page only: the four-pillar grid, events and gamer bands (bg-[#0D0B09]). |
| `lounge-warm` | `#111009` | Flames Lounge page only: the about strip and the kitchen menu bands (bg-[#111009]). |
| `ink-80` | `rgba(26, 22, 18, 0.8)` | Header nav links on cream (text-ink/80, about 8.1:1) and the About page lead. |
| `ink-70` | `rgba(26, 22, 18, 0.7)` | Secondary body text on cream: intros, form helper copy, the about body (text-ink/70, about 5.9:1). |
| `ink-60` | `rgba(26, 22, 18, 0.6)` | Card excerpts and artist names under release titles on cream (about 4.3:1) — FAILS by a little on cream; it passes only on the white/50 card fill (about 4.5:1). Use ink-70 for new text on cream. |
| `ink-50` | `rgba(26, 22, 18, 0.5)` | Quiet meta on cream. FAILS (about 3.2:1); kept because the site ships it. Large text only. |
| `ink-40` | `rgba(26, 22, 18, 0.4)` | Dates and input placeholders on cream. FAILS (about 2.5:1) — never for anything a visitor must read. |
| `bone-70` | `rgba(245, 237, 216, 0.7)` | Supporting copy on ink (about 8.0:1) and on the oxblood band (about 4.4:1, which FAILS for small text there; use bone on oxblood). |
| `bone-60` | `rgba(245, 237, 216, 0.6)` | The most used text colour in the app (431 uses): secondary text, nav links, table headers and footer links on ink (about 6.2:1). Also the hero lead over the photo. |
| `bone-50` | `rgba(245, 237, 216, 0.5)` | Tertiary text on ink and lounge grounds: card bodies, timestamps (about 4.7:1). The lightest bone that still passes for small text. |
| `bone-40` | `rgba(245, 237, 216, 0.4)` | Footer column labels and 'Full roster →' links on ink. FAILS (about 3.4:1) — passes only for text 24px and up. |
| `bone-30` | `rgba(245, 237, 216, 0.3)` | The footer copyright line and release dates on ink. FAILS (about 2.5:1); decoration only. |
| `line-ink` | `rgba(245, 237, 216, 0.1)` | The default hairline in the studio world: card and table borders, header rule, dividers on ink (border-bone/10, 273 uses). Decorative only (1.3:1). |
| `line-cream` | `rgba(139, 42, 31, 0.1)` | The default hairline on cream: header bottom rule, news card borders (border-oxblood/10). Hover goes to oxblood/30. Decorative only (1.2:1). |
| `input-edge` | `rgba(26, 22, 18, 0.6)` | Field borders on the public site (border-ink/60), drawn over the field's own fill. At least 3:1 against both the cream page and the fill: white field 3.6:1 / 4.7:1, bone field 4.0:1 / 4.5:1, cream field 4.3:1. The catalogue filter selects on cream use border-oxblood/65 (3.3:1). Focus adds a 2px oxblood outline. |
| `input-edge-ink` | `rgba(245, 237, 216, 0.45)` | Field borders in the studio world and on the ink footer (border-bone/45 over a bone-5 fill): 4.4:1 against ink and 3.9:1 against the field's own fill (4.3:1 and 3.8:1 measured from screen pixels). Fields on a bone-10 fill (search, invite codes) use border-bone/50 (4.2:1 against the fill). Focus adds a 2px ochre outline. |
| `danger-on-ink` | `#ff6467` | Hex of Tailwind v4 red-400, oklch(70.4% 0.191 22.216). Error messages and destructive actions in the portal, admin and bar till on ink (about 6.2:1, 52 uses). Always with words. |
| `danger-on-cream` | `#e7000b` | Hex of Tailwind v4 red-600, oklch(57.7% 0.245 27.325). The one public form error on cream. FAILS (about 3.7:1); use oxblood for error text on cream in new work. |
| `status-idea-bg` | `rgba(245, 237, 216, 0.10)` | Release production status pill fill for 'idea' (portal and admin releases manager), laid over ink. |
| `status-idea-fg` | `rgba(245, 237, 216, 0.70)` | Text of the 'idea' status pill on status-idea-bg over ink (about 6.7:1). |
| `status-preprod-bg` | `rgba(63, 90, 58, 0.25)` | Release production status pill fill for 'preprod' (portal and admin releases manager), laid over ink. |
| `status-preprod-fg` | `#9bb694` | Text of the 'preprod' status pill on status-preprod-bg over ink (about 6.9:1). |
| `status-tracking-bg` | `rgba(184, 137, 59, 0.20)` | Release production status pill fill for 'tracking' (portal and admin releases manager), laid over ink. |
| `status-tracking-fg` | `#b8893b` | Text of the 'tracking' status pill on status-tracking-bg over ink (about 4.3:1, FAILS for small text). |
| `status-mixing-bg` | `rgba(184, 137, 59, 0.35)` | Release production status pill fill for 'mixing' (portal and admin releases manager), laid over ink. |
| `status-mixing-fg` | `#e0b66b` | Text of the 'mixing' status pill on status-mixing-bg over ink (about 5.4:1). |
| `status-mastering-bg` | `rgba(199, 114, 74, 0.30)` | Release production status pill fill for 'mastering' (portal and admin releases manager), laid over ink. |
| `status-mastering-fg` | `#e5946f` | Text of the 'mastering' status pill on status-mastering-bg over ink (about 4.9:1). |
| `status-scheduled-bg` | `rgba(139, 42, 31, 0.30)` | Release production status pill fill for 'scheduled' (portal and admin releases manager), laid over ink. |
| `status-scheduled-fg` | `#e0907f` | Text of the 'scheduled' status pill on status-scheduled-bg over ink (about 6.2:1). |
| `status-live-bg` | `rgba(63, 90, 58, 0.30)` | Release production status pill fill for 'live' (portal and admin releases manager), laid over ink. |
| `status-live-fg` | `#82a57a` | Text of the 'live' status pill on status-live-bg over ink (about 5.3:1). |
| `status-done-bg` | `rgba(63, 90, 58, 0.30)` | Video job status pill fill for 'done' (portal videos), laid over ink. |
| `status-done-fg` | `#82a57a` | Text of the 'done' video job pill on status-done-bg over ink (about 5.3:1). Always with the word, never colour alone. |
| `status-rendering-bg` | `rgba(184, 137, 59, 0.35)` | Video job status pill fill for 'rendering' (portal videos), laid over ink. |
| `status-rendering-fg` | `#e0b66b` | Text of the 'rendering' video job pill on status-rendering-bg over ink (about 5.4:1). Always with the word, never colour alone. |
| `status-failed-bg` | `rgba(139, 42, 31, 0.40)` | Video job status pill fill for 'failed' (portal videos), laid over ink. |
| `status-failed-fg` | `#e0907f` | Text of the 'failed' video job pill on status-failed-bg over ink (about 5.8:1). Always with the word, never colour alone. |

## Spacing

| Token | Value | Usage |
| --- | --- | --- |
| `space-0.5` | `2px` | Vertical padding of pills and badges (py-0.5). |
| `space-1` | `4px` | Tight gaps; eyebrow-to-title gap on cards. |
| `space-1.5` | `6px` | Gap between streaming icons and small inline items; header button vertical padding. |
| `space-2` | `8px` | Input-to-label gap; small button vertical padding (py-2). |
| `space-2.5` | `10px` | Input and mobile-nav-row vertical padding (py-2.5). |
| `space-3` | `12px` | Button vertical padding (py-3, 307 uses); default gap in grids of tab cards. |
| `space-4` | `16px` | Page side gutter on phones (px-4, the most used spacing); card padding (p-4); grid gaps. |
| `space-5` | `20px` | Space above a lead under its rule; lounge event row padding. |
| `space-6` | `24px` | Page side gutter from 640px up (sm:px-6); card padding (p-6); news grid gap. |
| `space-7` | `28px` | Hero and CTA button side padding (px-7); header nav gap. |
| `space-8` | `32px` | Lounge pillar padding (p-8); section-header bottom margin on phones. |
| `space-10` | `40px` | Gap before hero buttons; section-header bottom margin from 640px up. |
| `space-16` | `64px` | Lounge section padding on phones (py-16); About page block spacing. |
| `space-20` | `80px` | Home page section padding (py-20). |
| `space-24` | `96px` | Lounge section padding from 640px up (sm:py-24). |

## Radius

| Token | Value | Usage |
| --- | --- | --- |
| `radius` | `4px` | The default (rounded, 264 uses; rounded-sm is the same 4px in Tailwind v4): every public button, the header 'Sign with us' button, inputs, release pills. |
| `radius-lg` | `8px` | Studio-world cards, tables and stat tiles (rounded-lg, 165 uses); the bar till's 'New tab' button. |
| `radius-xl` | `12px` | Bar tab cards and the Lounge pillar grid (rounded-xl). |
| `radius-2xl` | `16px` | The Lounge outdoor-studio feature panel only. |
| `radius-full` | `9999px` | Pills, badges, notification counts and status chips. |

## Shadow

| Token | Value | Usage |
| --- | --- | --- |
| `shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` | Tailwind's shadow-lg, used three times on dropdowns and toasts in the studio world. The brand does not lift things with shadows; borders do that work. |

## Layout

| Token | Value | Usage |
| --- | --- | --- |
| `content-max` | `1152px` | Maximum content width of every section (max-w-6xl), centred. |
| `prose-max` | `768px` | The About page column and long text blocks (max-w-3xl). |
| `header-height` | `96px` | Public header height (h-24), with the 80px logo-2 lockup inside. |
| `studio-header-height` | `80px` | Header of the portal, admin and bar till shell (sm:h-20; 64px on phones). |
| `rule-section` | `64px` | Width of the 1px oxblood rule under a section title (w-16). Heroes use 96px (w-24), lounge bands 56px (w-14). |

## Type

Families:

- `display`: Fraunces, Georgia, "Times New Roman", serif
- `sans`: Inter, system-ui, sans-serif
- `mono`: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace

### Display (`display`)

| Style | Size / line | Weight | Sample | Usage |
| --- | --- | --- | --- | --- |
| `hero` | 88px / 1.02, tracking -0.025em | 700 | Pressed in Montego Bay. | Home hero only, bone on the darkened photo. clamp(3rem, 7vw, 5.5rem), so 48px on phones. Tracking -0.025em. The Flames Lounge hero runs to 96px at 0.96 leading. |
| `page-title` | 64px / 1.02, tracking -0.025em | 700 | Artists | H1 in the ink banner that opens each inner public page (artists, releases, videos, news, privacy, terms). clamp(2.5rem, 5vw, 4rem), 40px on phones. |
| `band-title` | 48px / 1.25 | 700 | Sign with One Flame. | Headline of a full-width band: the oxblood call-to-action band, the Sign page and Flames Lounge sections. clamp(2rem, 4vw, 3rem), 32px on phones. |
| `section-title` | 36px / 1.05, tracking -0.025em | 700 | Latest Releases | SectionHeader H2: oxblood on cream, bone on ink, always with an eyebrow above and a 64px rule below. 30px on phones. |
| `card-title` | 24px / 32px | 700 | Bar Tabs | Titles inside the studio world (page H1s in portal, admin and the bar till) and big cards. 20px and 18px versions title pillar cards, tab cards and artist names on photos. |
| `title-sm` | 16px / 1.375 | 600 | Fish Fritters | Release titles, news card titles, menu item names, event titles. Semibold (600) is used only at this size. |
| `figure` | 20px / 28px | 700 | $600 | Stat tiles in the bar till and admin dashboards (Today's Sales). Bone, or ochre for money still owed. |

### Text (`sans`)

| Style | Size / line | Weight | Sample | Usage |
| --- | --- | --- | --- | --- |
| `lead` | 18px / 1.625 | 400 | An independent reggae and dancehall label rooted in the tradition of Jamaican music. | Intro paragraph under a hero or page title. bone-60 on ink, ink-80 on cream. |
| `body` | 16px / 1.625 | 400 | We work with artists who have something real to say. If that's you, we want to hear it. | Default reading text. The About page sets it at 17px (1.05rem). |
| `body-sm` | 14px / 20px | 400 | New releases, events, and label news — straight to your inbox. | The workhorse (550 uses): card bodies, table cells, nav links, form inputs. Use 1.625 line height for prose. |
| `button` | 14px / 20px | 600 | Get in touch | Button and link-button labels. Nav links use 500. |
| `eyebrow` | 11px / 16px, tracking 0.22em | 600 | MONTEGO BAY · JAMAICA | Uppercase label above every section title (105 uses of 11px). Tracking 0.22em; 0.28em on heroes. forest on cream; on dark grounds use sage or ochre (forest fails there). |
| `caption` | 12px / 16px | 400 | May 20, 2026 | Dates, meta lines, helper text (577 uses of 12px). |
| `micro` | 10px / 14px, tracking 0.05em | 600 | SINGLE | Uppercase pills, stat-tile labels, footer column heads. Tracking 0.05em (tracking-wider, 149 uses). |

### Mono (`mono`)

| Style | Size / line | Weight | Sample | Usage |
| --- | --- | --- | --- | --- |
| `money` | 24px / 32px | 400 | $300 | Running tab totals in the bar till, in ochre. Whole Jamaican dollars shown as $ with thousands commas (formatJmd in src/lib/bar/pos.ts), never cents. The samples here are the gaming session rates from the code (30 and 60 minutes), not menu prices. |
| `mono-sm` | 12px / 16px | 400 | 9:42 PM | Times, catalogue numbers and hex codes in the till, portal and admin tables. |
