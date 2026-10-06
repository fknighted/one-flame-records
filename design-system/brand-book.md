# One Flame Records brand book

One Flame Records is an independent reggae and dancehall label in Montego Bay, Jamaica. It also runs Flames Lounge, a venue with an outdoor recording studio, a gaming lounge, a kitchen and a bar. One app serves all of it: the public site, a portal for signed artists, the label's admin, the bar till (the point-of-sale screen bar staff use to run customer tabs) and a portal for gaming members. The look is a vintage Jamaican record sleeve made for the web: warm cream paper, oxblood red headlines in a heavy serif, a forest green accent, and ochre saved for the one thing you want pressed.

## Voice and content

- Sound like the back of a record sleeve, not a tourism advert. Confident, grounded, specific. Short sentences, active verbs, real details.
- Write as the label: "we". Talk to the artist or visitor as "you". "We work with artists who have something real to say. If that's you, we want to hear it."
- Headlines are short, sentence case, and usually end with a full stop: "Pressed in Montego Bay." "One flame is enough." "Sign with One Flame." Page names inside the app stay plain nouns with no full stop ("Bar Tabs", "Latest Releases").
- Eyebrows (the small uppercase label above a heading) use a middle dot as a separator: "MONTEGO BAY · JAMAICA".
- Arrows end text links: "Full roster →", "Read more →", "Visit the label →". ↗ marks a link to another site. ✓ confirms an action in the admin ("✓ Copied").
- Never write "Welcome to our family!", "Vibes only", "irie" used ironically, or "soulful" used straight. No tropical-paradise clichés. No Jamaican Patois for flavour unless the person wrote in it first.
- Do not invent slogans, values, awards, chart positions, stream counts, sales figures, prices, opening hours, an address or a phone number. None are published.
- **Never repeat the old About page timeline.** Frank confirmed on 2026-10-05 that its founding story and "ten million combined streams" are not true; the rest of that timeline (first release, distribution deal, radio play) is untraced and went with it. It was removed from the site on 2026-10-05, along with the line "Distribution is worldwide." Never claim a founding date, a deal, a stream count, chart play or an award.
- **The studio line is true.** "Production, mixing, and video work happen in-house at our Montego Bay studio" (About page) was confirmed by Frank on 2026-10-05 and may be repeated.
- Never announce a release date, title or featured artist that is not confirmed. Name artists and releases exactly as credited, and never speak for an artist in the first person.
- Money in the bar and gaming screens is whole Jamaican dollars, shown as "$600" with no cents. Never quote a food or drink price outside the till.
- No emoji on public pages or in brand copy. The public site uses none.

Real copy to model on:

> Pressed in Montego Bay.

> You keep your publishing. We handle the platform.

> What the roster has in common is not a genre; it's a standard. The music has to mean something.

> We sign artists, not sounds — if the music is rooted, honest, and built to last, we want to hear it.

> Walk-in welcome — no reservation needed.

One line on the live Lounge page breaks these rules ("just here for the vibes"). Do not copy it.

## Two worlds, one palette

The app has two environments. They are surfaces, not a light and dark theme: every colour keeps its value everywhere.

- **Cream** is the public label: `cream` ground with a faint paper-grain texture (a fixed noise layer at 5.5% opacity, multiplied over the page). Headlines `oxblood`, text `ink`.
- **Ink** is studio mode: the artist portal, the admin, the bar till and the gamer portal all sit on `ink` with `bone` text, so photos, video and numbers stand out. No paper grain here.
- The public site borrows ink for weight. The home hero, the inner-page banners and the footer are `ink` bands, and the closing call to action is an `oxblood` band. The home page alternates ink, cream, ink, cream, oxblood. Keep that rhythm; do not invent a third ground.
- **Flames Lounge** has its own night: `lounge-night`, `lounge-deep` and `lounge-warm` are near-blacks darker than `ink`, used only on the Lounge page so the venue reads as evening.

## Colour

- On `cream`: headings `oxblood`, body `ink`, supporting text `ink-70` (5.9:1) or `ink-80`. Eyebrows are `forest`. `ink-60` is just under the 4.5:1 floor on cream (4.3:1), and `ink-50`/`ink-40` fail outright; use `ink-70` for anything a visitor must read.
- On `ink`: headings `bone`, supporting text `bone-60` (the most used colour in the app, 6.2:1), tertiary `bone-50` (4.7:1, the lightest that passes). `bone-40` and `bone-30` fail for small text; keep them for decoration or text 24px and up.
- `oxblood` is the flame: headlines on cream, the 1px rule under every section title, primary buttons, the closing band. On `ink` it is only a fill or a border. As text or an icon on ink it is 2.1:1 and fails; use `rose` there.
- `forest` is the inner flame: eyebrows on cream, EP pills. On `ink` it fails (2.3:1). `SectionHeader` paints its eyebrow `sage` on dark grounds (6.5:1, since 2026-10-05), but the home hero, the ink banners that open inner public pages and the Lounge sections still set their eyebrows in `forest`. In new work, set dark-ground eyebrows in `sage` or `ochre`.
- `ochre` is the trap: a strong colour for the one thing that needs attention. Solid ochre buttons with `ink` text (5.7:1), the "new" badge, money on the bar till, link hover, the focus outline on ink. Never a surface or a large field. Never text on cream (2.4:1). Text on ochre is always `ink`, including when a button hovers to ochre.
- `rose` and `sage` are oxblood and forest lifted for dark grounds. Use them for error and success text on ink. `rose` also carries the Lounge pillar icons and menu labels (7.7–7.9:1); `sage` the dark `SectionHeader` eyebrow.
- Status pills in the portal pair a `status-*-bg` fill with its `status-*-fg` text, always with the word ("Mixing", "Live", "Failed"), never colour alone. `status-tracking-fg` is 4.3:1, just under the floor.
- Errors: `danger-on-ink` in the studio world. On cream, use `oxblood` for error text; the one place the site uses red on cream (`danger-on-cream`) fails at 3.7:1.
- Instagram pink and Facebook blue appear only as platform tags inside the admin's campaign screen. They are not brand colours.

## Type

- Three families, all Google fonts loaded with `next/font`: **display** (Fraunces) for headlines and big figures, **sans** (Inter) for everything read, **mono** (JetBrains Mono) for money, times and codes in the till and portal.
- Fraunces is always bold (700) in headlines. Semibold (600) only at `title-sm`. Never use it for body text.
- Size by role: `hero` only on the home and Lounge heroes; `page-title` for the ink banner that opens an inner public page; `band-title` for full-width bands; `section-title` for SectionHeader; `card-title` for page and card titles in the studio world; `title-sm` for release, news, menu and event titles.
- Every public section opens the same way: an `eyebrow` (11px, semibold, uppercase, tracked 0.22em), the `section-title`, then a short 1px `oxblood` rule (`rule-section`, 64px wide) under it. On ink the rule is `bone` at 30%. This trio is the signature of the layout.
- Body is `body` (16px, loose 1.625 line height) or `body-sm` (14px). `caption` (12px) for dates and meta, `micro` (10px uppercase) for pills and stat labels.
- Money and times on the bar till are `money` and `mono-sm`, in `ochre` for a running total and `bone` for a settled one.

## Layout and spacing

- Content is centred at `content-max` (1152px) with a `space-4` side gutter on phones and `space-6` from 640px up.
- Public sections pad `space-20` top and bottom; Lounge sections `space-16`, then `space-24` from 640px up.
- Long reading (About, legal pages) sits in `prose-max` (768px).
- Grids: artist photos are 2 columns on phones, 3 on tablets, 4 on desktop, with a hairline 4–6px gap so they read as a contact sheet. Release covers scroll sideways on phones and sit 3 or 6 across above that.
- Tables in the studio world scroll sideways inside one bordered box, with a minimum width on the table so columns never collapse on a phone.

## Edges, corners and depth

- Corners are small and quiet. `radius` (4px) for every public button, input and pill; `radius-lg` (8px) for studio-world cards, tables and stat tiles; `radius-xl` for bar tab cards and the Lounge grid; `radius-full` for pills and badges. Photos (artist cards, release covers, the hero) are square-cornered.
- Borders do the work, not shadows. `line-cream` (oxblood at 10%) on cream, `line-ink` (bone at 10%) on ink. Hover strengthens the border (oxblood at 30%, or ochre at 40% on the bar till).
- The public footer carries a 2px solid `oxblood` top border.
- There is almost no shadow. `shadow-lg` appears only on a few dropdowns. Do not add lift to cards.

## Controls and states

- **Primary button on cream:** `oxblood` fill, `bone` text, `button` style, `radius`, `space-6` side padding, `space-3` vertical. Hover turns the fill `ochre` and the text `ink` (5.7:1). Never leave `bone` text on the ochre hover (2.7:1).
- **Primary button on ink:** `ochre` fill, `ink` text. Hover goes to `bone` (public) or ochre at 90% (studio world).
- **Ghost button:** transparent with a 1px border — `oxblood` at 40% on cream ("Sign with us" in the header), `bone` at 30% on ink. Hover fills it.
- **Light button on oxblood:** `bone` fill, `ink` text ("Get in touch" on the closing band).
- **Text link:** `oxblood` on cream, `ochre` on ink, ending in →. Hover goes to `ochre` on cream (hover only — it fails as resting text).
- **Section header action:** a quiet link at right ("All releases →") in oxblood at 60% on cream or `bone-40` on ink. Both fail contrast; in new work use `oxblood` and `bone-60`.
- **Input on cream:** `bone`, `cream` or white field, `input-edge` border (ink at 60%), `body-sm` text, label above in `ink` medium. The border clears 3:1 against both the cream page and the field's own fill (3.6:1 at worst, on white). Focus: a 2px `oxblood` outline (6.7:1 on cream, 7.3:1 on bone, 8.6:1 on white), plus the oxblood border and 1px ring where the field already had them. The catalogue filter selects use oxblood at 65% for their border (3.3:1).
- **Input on ink:** bone at 5% fill, `input-edge-ink` border (bone at 45%; bone at 50% on the bone-10 fields of search and invite codes). The border is 4.4:1 against ink and 3.9:1 against its fill. Focus: a 2px `ochre` outline (5.7:1 on ink, 5.1:1 on a bone-5 card).
- **Pills:** release type pills are `micro` text on a solid fill — single `ochre`/`ink`, EP `forest`/`bone`, album `oxblood`/`bone`, mixtape `ink`/`bone`.

**Focus is always visible.** Since 2026-10-05 every form field in the app shows a solid 2px focus outline: `oxblood` on cream and `ochre` on ink or the lounge grounds (6.1 to 6.4:1). Give every new field and interactive element the same, and never remove the browser outline without a visible replacement. One element still does: the `VideoEmbed` play button replaces it with a 2px oxblood ring over the video thumbnail, so its contrast depends on the image.

## Imagery

- Real photographs only: the label's artists, its shows and its own spaces. Warm white balance, natural or available light, real places, grain over gloss. Black-and-white works well on ink.
- The one real brand photo in the code is the home hero, a night performance at an outdoor Montego Bay venue (Imagery group). It always sits under an `ink` layer at 72% with a soft oxblood glow, so bone text reads on it.
- Artist photos and release covers come from the label's own uploads (not in this system). Show artist photos square, with an ink gradient from the bottom and the stage name in `display` bold `bone`.
- There are no real photos of Flames Lounge yet. The stock photo of another bar was removed from the Lounge page on 2026-10-05; the hero is now drawn from the palette only — the `lounge-night` ground, a soft oxblood glow and a large faint flame mark (14% opacity, hidden on phones). When the owner supplies a real photo, it goes in that spot. Never use a stock or AI image as if it were the Lounge. The old file `public/flames-lounge-hero.jpg` is still in the repository, unused; do not use it.
- The app can generate images and music videos with AI. Never present a generated image as a real photo of an artist, a show or the Lounge. Generated people must be Jamaican, described by visible detail and setting, per the label's video rules.
- Avoid tourism imagery: palm-tree postcards, beach paradise, theme-park Jamaica.

## Logo and iconography

- The mark is a flame in `oxblood` with a `forest` inner flame, printed with a speckled texture, above or beside "ONE FLAME" in a condensed slab. Use the files in the Logos group as they are: never redraw, recolour, stretch or separate the flame from its inner flame.
- The formal lockup carries "MONTEGO BAY · JAMAICA" (`logo.png`, `logo-1.png`). Use the shorter lockups where space is tight, and the flame alone (`icon.png`) for favicons and avatars.
- Every logo file has oxblood lettering. It reads on `cream` and `bone`; on `ink` the lettering is about 2.1:1, so the app's sidebars and social card place it there anyway. Prefer cream grounds for the logo, and treat a bone-lettered version for dark grounds as missing.
- Icons are hand-written inline line icons (24px grid, 1.5–2px stroke, round caps) that take the text colour. There is no icon library. Placeholders for missing photos use a small two-path flame glyph at 10–15% opacity.
- Text characters do the rest: → for actions, ← for back, ↗ for other sites, ↓ for downloads, ✓ for done, · as a separator.

## Flames Lounge and the bar

- The Lounge page is part of the public site but lives at night: `lounge-*` grounds, `bone` headlines, eyebrows in `ochre` or `forest` (use `ochre` — forest fails here, at about 2.5:1), icons and menu category labels in `rose`, menu and event rows divided by bone at 6%.
- Menu items name the food plainly ("Fish Fritters — Crispy Jamaican-style, made fresh to order") and never show a price.
- The bar till (`/bar`) is the ink studio world tuned for speed on a phone behind a bar: big `ochre` "open tab" buttons, tab cards with the customer name in `display` and the running total in `money`, a settled-today table in `mono-sm`.
- The gamer portal uses the same ink world. Gaming time is sold in 30- and 60-minute sessions; show durations and balances in `mono`.

## Not synced

From `fknighted/one-flame-records` at `main@f7d9bac`.

- **Colours** are the `@theme inline` tokens in `src/app/globals.css` (core six, rose, sage and the release and video status pairs) plus the opacity steps the components use most, written out as rgba. The three Lounge near-blacks are hex values written directly in `src/app/(public)/flames-lounge/page.tsx`; their gradient end `#1A0C07` was left out (one use). Admin-only platform colours were left out.
- **Fonts:** none fetched. Fraunces, Inter and JetBrains Mono are Google fonts loaded through `next/font`; the repository ships no font files.
- **Images:** `hero-bg.jpg` was resized to 1600px wide; the original is 1920px. The old Flames Lounge hero (`public/flames-lounge-hero.jpg`) was left out because it is a stock photo; the site no longer shows it. The Next.js starter icons were left out.
- **Components:** no live previews. The real components stay in the repository; "Building in the app" lists each one and its file.
- `docs/brand.md` in the repository is partly out of date (it names Cooper Std or Recoleta, a `tailwind.config.ts` and SVG logos in `public/brand/` that do not exist). This system follows the code.
