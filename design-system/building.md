# Building in the app

For Claude Code, Codex or any agent changing the `one-flame-records` repository (`Projects/one flame app`). The repository's code is the truth; this page tells you which of its pieces to reach for and how this system's tokens are written there. Read the repository's own `CLAUDE.md` and `AGENTS.md` first. Its `docs/brand.md` is partly out of date (it names Cooper Std or Recoleta, a `tailwind.config.ts`, and SVG logos in `public/brand/` that do not exist); where it disagrees with the code or with this page, the code wins.

## The stack

- Next.js 16 (App Router), React 19, Tailwind CSS v4. There is no `tailwind.config` file: brand colours and font variables live in the `@theme inline` block in `src/app/globals.css`.
- Fonts load in `src/app/layout.tsx` through `next/font/google`: Fraunces (`--font-display`), Inter (`--font-sans`), JetBrains Mono (`--font-mono`). Use the classes `font-display`, `font-sans`, `font-mono`.
- Styling is Tailwind utility classes written directly on elements. No CSS per component, no component library.
- Each world is a wrapper class on its route group's layout, not a runtime toggle: `src/app/(public)/layout.tsx` sets `bg-cream` and the paper grain; `src/components/InkShell.tsx` sets `bg-ink text-bone` for the portal, admin, bar till and gamer portal.

## Rules

1. Do not add new colours, fonts or shadows. Use the tokens below. If a design truly needs one, add it to `@theme inline` in `src/app/globals.css` with a comment, and add it to this system. Do not keep writing raw hex in `className` (the Lounge page does; do not copy that habit).
2. Never mix the two worlds in one component. Public pages may stack cream, ink and oxblood bands; the studio world is ink only.
3. Every public section opens with `SectionHeader` (eyebrow, display title, short rule). Do not hand-roll a new heading pattern.
4. On dark grounds, eyebrows are `text-sage` or `text-ochre`, not `text-forest` (2.3:1 on ink). Icons and small text on dark grounds are `text-rose`, not `text-oxblood` (2.1:1).
5. Text a visitor must read on cream is at least `text-ink/70`. On ink, at least `text-bone/50`.
6. Every form field carries a 2px focus outline: `focus:outline-2 focus:outline-oxblood` on cream, `focus:outline-2 focus:outline-ochre` on ink. Copy that on new fields; for buttons and links use the `focus-visible:` form of the same classes. Never add `focus:outline-none` without a visible replacement.
7. Field borders must clear 3:1 against both the page and the field's own fill: `border-ink/60` on cream, `border-bone/45` on ink (`border-bone/50` on a `bg-bone/10` field). Lighter borders fail.
8. Bar money is whole Jamaican dollars. Format with `formatJmd()` and read "today" with `jamaicaMidnight()`, both in `src/lib/bar/pos.ts`. Never write a new `_cents` value.
9. Tables scroll inside one container: `<div className="border border-bone/10 rounded-lg overflow-x-auto"><table className="w-full min-w-[Npx]">`. Never nest `overflow-hidden` around it (it blocks scrolling on iPhone).
10. Interactive bits inside a Server Component page go in their own `*Client.tsx` or `*Button.tsx` file.
11. Check every change at phone width (390px). The bar till and the gamer portal are used on phones.

## Tokens as Tailwind classes

| Token | Tailwind class |
| --- | --- |
| `cream`, `ink`, `bone`, `oxblood`, `forest`, `ochre`, `rose`, `sage` | `bg-*`, `text-*`, `border-*` with the same name |
| `lounge-night` / `lounge-deep` / `lounge-warm` | `bg-[#0A0806]` / `bg-[#0D0B09]` / `bg-[#111009]` (Lounge page only, not yet theme tokens) |
| `ink-80` / `ink-70` / `ink-60` / `ink-50` / `ink-40` | `text-ink/80` … `text-ink/40` (40 and 50 fail on cream) |
| `bone-70` / `bone-60` / `bone-50` / `bone-40` / `bone-30` | `text-bone/70` … `text-bone/30` (40 and 30 fail on ink) |
| `line-cream` / `line-ink` | `border-oxblood/10` / `border-bone/10` |
| `input-edge` | `border-ink/60` (cream-world fields on a bone, cream or white fill); filter selects on cream use `border-oxblood/65` |
| `input-edge-ink` | `border-bone/45` on a `bg-bone/5` field; `border-bone/50` on a `bg-bone/10` field |
| Field focus | `focus:outline-2 focus:outline-oxblood` (cream) / `focus:outline-2 focus:outline-ochre` (ink) |
| `danger-on-ink` / `danger-on-cream` | `text-red-400` / `text-red-600` |
| `status-<name>-bg` / `status-<name>-fg` | `bg-status-<name>-bg` / `text-status-<name>-fg` (idea, preprod, tracking, mixing, mastering, scheduled, live, done, rendering, failed) |
| `radius` / `radius-lg` / `radius-xl` / `radius-2xl` / `radius-full` | `rounded` / `rounded-lg` / `rounded-xl` / `rounded-2xl` / `rounded-full` |
| `shadow-lg` | `shadow-lg` (rare; prefer a border) |
| `content-max` / `prose-max` | `max-w-6xl` / `max-w-3xl` |
| Page gutter | `px-4 sm:px-6` |
| Section padding | `py-20` (home), `py-16 sm:py-24` (Lounge) |

| Type style | Tailwind classes |
| --- | --- |
| `hero` | `font-display font-bold text-[clamp(3rem,7vw,5.5rem)] leading-[1.02] tracking-tight` |
| `page-title` | `font-display font-bold text-[clamp(2.5rem,5vw,4rem)] leading-[1.02] tracking-tight` |
| `band-title` | `font-display font-bold text-[clamp(2rem,4vw,3rem)] leading-tight` |
| `section-title` | `font-display font-bold text-3xl sm:text-[2.25rem] leading-[1.05] tracking-tight` (via `SectionHeader`) |
| `card-title` | `font-display font-bold text-2xl` |
| `title-sm` | `font-display font-semibold text-base leading-snug` |
| `figure` | `font-display font-bold text-xl` |
| `lead` | `text-lg leading-relaxed` |
| `body` | `leading-relaxed` |
| `body-sm` | `text-sm` |
| `button` | `text-sm font-semibold` |
| `eyebrow` | `text-[11px] font-semibold uppercase tracking-[0.22em]` (heroes `tracking-[0.28em]`) |
| `caption` | `text-xs` |
| `micro` | `text-[10px] font-semibold uppercase tracking-wider` |
| `money` | `font-mono text-2xl text-ochre` |
| `mono-sm` | `font-mono text-xs` |

## Ready-made patterns

Primary button on cream:

```tsx
<Link href="/contact" className="inline-block rounded bg-oxblood px-6 py-3 text-sm font-semibold text-bone hover:bg-ochre hover:text-ink transition-colors">Get in touch</Link>
```

Keep `hover:text-ink`: bone text on the ochre hover is only 2.7:1. Every oxblood button that hovers to ochre has it since 2026-10-05.

Primary button on ink:

```tsx
<Link href="/artists" className="inline-block rounded bg-ochre px-7 py-3 text-sm font-semibold text-ink hover:bg-bone transition-colors">Our Artists</Link>
```

Ghost button on cream (header):

```tsx
<Link href="/sign" className="text-sm font-semibold text-oxblood border border-oxblood/40 rounded px-3.5 py-1.5 hover:bg-oxblood hover:text-bone transition-colors">Sign with us</Link>
```

Section opening:

```tsx
<SectionHeader eyebrow="Discography" title="Latest Releases" action={<Link href="/releases" className="text-sm text-oxblood hover:text-ochre transition-colors">All releases →</Link>} />
```

Pass `dark` on ink: `SectionHeader` then paints the eyebrow `text-sage` (it is `text-forest` on cream). Hand-written eyebrows in the ink page banners and on the Lounge page still use `text-forest` / `text-[#3F5A3A]`, which fail there; do not copy them.

Field on cream (from `ContactForm`):

```tsx
<input className="w-full rounded border border-ink/60 bg-bone px-3 py-2.5 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-2 focus:outline-oxblood focus:ring-1 focus:ring-oxblood" />
```

Field on ink (from `SubscribeForm`):

```tsx
<input className="flex-1 min-w-0 rounded bg-bone/5 border border-bone/45 px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-2 focus:outline-ochre focus:border-ochre/50" />
```

Studio-world card:

```tsx
<div className="border border-bone/10 rounded-lg p-4">
  <p className="text-[10px] text-bone/60 uppercase tracking-wider mb-1">Today's Sales</p>
  <p className="text-xl font-display font-bold text-bone">{formatJmd(todayRevenue)}</p>
</div>
```

## Components to reuse

Reach for these before writing new markup. All are in `src/components/` unless noted.

| Component | File | Use it for |
| --- | --- | --- |
| `PublicHeader`, `PublicFooter` | `PublicHeader.tsx`, `PublicFooter.tsx` | Public site chrome, already in `src/app/(public)/layout.tsx`. Do not add another. |
| `InkShell` | `InkShell.tsx` | The frame (header, side nav, logo) for every portal, admin, bar and gamer page. Already in those layouts. |
| `SectionHeader` | `SectionHeader.tsx` | Eyebrow, display title and rule at the top of a public section; `dark` on ink. |
| `ArtistCard` | `ArtistCard.tsx` | Square artist photo with gradient and stage name, in roster grids. |
| `ReleaseCard` | `ReleaseCard.tsx` | Square cover, title, type pill, artist, date and streaming icons; `dark` on ink. |
| `VideoEmbed` | `VideoEmbed.tsx` | A 16:9 YouTube or stored video with title and artist. |
| `ReleasesFilter`, `VideosFilter` | same names | Filter and sort chips on the public catalogue pages. |
| `ContactForm`, `SubscribeForm`, `SignupForm` | same names | The public contact form, footer newsletter box, and artist QR sign-up. |
| `MenuGrid` | `MenuGrid.tsx` | The tap-to-add item grid on a bar tab (`src/app/bar/tabs/[id]/page.tsx`). |
| `AddStockForm`, `InventoryAddRow`, `MenuItemForm` | same names | Bar stock and menu editing. Bartenders may only add stock. |
| `VideoRequestForm` / `AdminVideoRequestForm` | same names | AI music video requests. Their `STYLE_PRESETS` lists must stay identical. |
| `ReleasesManagerFilter`, `VideoLibraryFilter` | same names | Status and format chips in the portal. |
| `ToastProvider` | `ToastProvider.tsx` | Confirmation toasts in the admin. |
| `CopyButton`, `RetryButton`, `LogoutButton` | same names | Small client-side buttons. |

Copy and tone rules are in the brand book's "Voice and content" section and in `knowledge-base/brand-and-voice.md`.
