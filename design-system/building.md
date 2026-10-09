# Building in the app

For Claude Code, Codex or any agent changing the `one-flame-records` repository (`Projects/one flame app`). Read the repository's own `CLAUDE.md` and `AGENTS.md` first.

**The repository is still on the old record-sleeve look** (cream, oxblood, Fraunces, Inter, JetBrains Mono) until the Sound System rebuild lands. Everything below is the target. Do not start the rebuild, or mix the two looks on one page, until Frank approves it. The rebuild goes page by page in this order, checked on a phone at every step: home, artists, releases, videos, news, Lounge, About, Contact, Sign with us. Studio screens (portal, admin, bar till, gamer portal) come last and change how they look, never how they work.

The repository's `design-system/` folder holds the old system. It is replaced by this one when the rebuild starts; `docs/brand.md` is out of date and should not be followed.

## The stack

- Next.js 16 (App Router), React 19, Tailwind CSS v4. There is no `tailwind.config` file: colours and font variables live in the `@theme inline` block in `src/app/globals.css`.
- Fonts load in `src/app/layout.tsx` through `next/font/google`. Today that is Fraunces, Inter and JetBrains Mono; the rebuild replaces them with Big Shoulders Display and Archivo.
- Styling is Tailwind utility classes on elements. No CSS file per component, no component library.
- Each area is a wrapper on its route group's layout: `src/app/(public)/layout.tsx` (today `bg-cream` plus the paper-grain overlay) and `src/components/InkShell.tsx` (today `bg-ink text-bone`) for the portal, admin, bar till and gamer portal. In the rebuild both become `bg-black text-paper`, and the grain overlay is removed.

## Proposed theme

Add these to `src/app/globals.css` when the rebuild starts. During the changeover the old tokens stay beside them, so pages not yet rebuilt keep working; remove the old ones when the last page moves.

```css
@theme inline {
  /* Sound System */
  --color-black:  #0F0D0B;  /* overrides Tailwind's pure black on purpose; the repo does not use bg-black today */
  --color-yellow: #F2C230;
  --color-red:    #C8321F;  /* bg-red, text-red. Tailwind's red-400 etc. are separate and stay until replaced */
  --color-paper:  #FFF7E6;
  --color-green:  #2F6B3A;
  --color-muted:  #D8CCB4;
  --color-line:   #3A332B;
  --color-panel:  #16130F;
  --color-raised: #2A241E;

  --font-poster: var(--font-big-shoulders);
  --font-text:   var(--font-archivo);
}
```

```tsx
// src/app/layout.tsx
import { Big_Shoulders, Archivo } from "next/font/google";

// Big Shoulders Display is now one family, "Big Shoulders", with an optical-size axis.
const poster = Big_Shoulders({ variable: "--font-big-shoulders", subsets: ["latin"], axes: ["opsz"], display: "swap" });
const text = Archivo({ variable: "--font-archivo", subsets: ["latin"], weight: ["400", "500", "600", "800"], display: "swap" });
```

The installed `next/font/google` (Next.js 16.3.8) has no `Big_Shoulders_Display` export, only `Big_Shoulders`, whose optical-size axis (`opsz`, 10 to 72) contains the Display design at its top end. To match the concept at every size, add `[font-variation-settings:'opsz'_72]` to poster text (or set it once on `.font-poster`); without it, small poster text such as `title-sm` picks a less condensed cut. Google Fonts still serves the old "Big Shoulders Display" name for pages outside the app, such as this system's cover. Read `node_modules/next/dist/docs/` before changing the layout, as `AGENTS.md` asks.

## Tokens as Tailwind classes

| Token | Tailwind class |
| --- | --- |
| `black`, `yellow`, `red`, `paper`, `green`, `muted`, `line`, `panel`, `raised` | `bg-*`, `text-*`, `border-*`, `outline-*` with the same name |
| `lens` | `bg-black/50` |
| `logo-red`, `logo-green` | none. They live only inside the logo files. |
| `radius-none` | no class (the default); never add `rounded-*` |
| `radius-round` | `rounded-full`, only for the logo lens, the speaker rings and grille holes |
| `border-hair` / `border-field` / `border-rule` / `border-band` | `border` / `border-2` / `border-[3px]` / `border-4` |
| `focus-width` + `focus-offset` | `focus-visible:outline-3 focus-visible:outline-offset-2` plus the colour for the ground |
| `content-max` / `read-max` | `max-w-6xl` / `max-w-[66ch]` |
| `gutter` / `gutter-wide` | `px-4 sm:px-6` |
| `control-height` | `min-h-[46px]` |
| Section padding | `py-14 sm:py-[88px]` |

| Type style | Tailwind classes |
| --- | --- |
| `poster` | `font-poster font-black uppercase leading-[0.82] tracking-[-0.01em] text-[clamp(56px,9vw,112px)]` |
| `headline` | `font-poster font-black uppercase leading-[0.85] text-[clamp(36px,7vw,64px)]` |
| `title` | `font-poster font-extrabold uppercase leading-[0.95] text-[32px]` |
| `title-sm` | `font-poster font-extrabold uppercase leading-none tracking-[0.01em] text-2xl` |
| `number` | `font-poster font-black tabular-nums text-[44px] leading-none` |
| `money` | `font-poster font-extrabold tabular-nums text-2xl leading-none text-yellow` |
| `lead` | `font-text font-semibold text-lg leading-normal` |
| `body` | `font-text text-[17px] leading-[1.6]` |
| `body-sm` | `font-text text-base leading-[1.6]` |
| `button` | `font-text font-extrabold uppercase tracking-[0.04em] text-[15px] leading-none` |
| `label` | `font-text font-extrabold uppercase tracking-[0.06em] text-[13px]` |
| `small` | `font-text font-semibold text-[13px]` |
| `caption` | `font-text font-semibold text-xs` |

Focus colour by ground: `focus-visible:outline-red` on paper, `focus-visible:outline-yellow` on black and panel, `focus-visible:outline-black` on yellow, `focus-visible:outline-paper` on red. Fields use `focus:` rather than `focus-visible:`.

## Ready-made patterns

Main button (one per screen):

```tsx
<Link href="/artists" className="inline-flex min-h-[46px] items-center px-5 bg-yellow text-black font-text font-extrabold uppercase tracking-[0.04em] text-[15px] leading-none hover:bg-paper focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow">Hear the roster</Link>
```

On a yellow block, give it `focus-visible:outline-black`, or use the outlined button there instead.

Outlined button (second action):

```tsx
<Link href="/sign" className="inline-flex min-h-[46px] items-center px-5 bg-black text-yellow shadow-[inset_0_0_0_2px_var(--color-yellow)] font-text font-extrabold uppercase tracking-[0.04em] text-[15px] leading-none hover:bg-yellow hover:text-black focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-yellow">Sign with us</Link>
```

The inset shadow here is a hard 2px edge, not a soft shadow; `border-2 border-yellow` works the same.

Lounge button:

```tsx
<Link href="/flames-lounge" className="inline-flex min-h-[46px] items-center px-5 bg-red text-paper font-text font-extrabold uppercase tracking-[0.04em] text-[15px] leading-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-paper">Visit the Lounge</Link>
```

Section opener (replaces the eyebrow, title and thin rule of today's `SectionHeader`):

```tsx
<div className="mb-8">
  <h2 className="font-poster font-black uppercase leading-[0.85] text-[clamp(36px,7vw,64px)]">{title}</h2>
  <div className="mt-2 h-2 w-[72px] bg-red" />
</div>
```

The five-word rule, in code:

```ts
const tooLong = (s: string) => s.trim().split(/\s+/).length > 5 || s.split(/\s+/).some((w) => w.length > 12);
// poster or headline when !tooLong(text), otherwise the title classes
```

Field on paper:

```tsx
<label className="grid gap-1.5">
  <span className="font-text font-semibold text-sm text-black">Your email</span>
  <input type="email" className="min-h-[46px] px-3 border-2 border-black bg-paper text-black font-text text-base focus:outline-3 focus:outline-offset-2 focus:outline-red" />
</label>
```

Artist tile without a photo:

```tsx
const TILE = ["bg-yellow text-black", "bg-red text-paper", "bg-paper text-black", "bg-raised text-paper"];
<Link href={`/artists/${slug}`} className={`${TILE[i % 4]} aspect-square flex flex-col justify-between p-3 font-poster font-black uppercase leading-[0.88] overflow-hidden`}>
  <span className="text-[clamp(54px,9vw,96px)] leading-[0.75]">{stage_name[0]}</span>
  <span className="text-[28px]">{stage_name}<small className="block font-text font-semibold normal-case text-xs tracking-normal">Signed to One Flame</small></span>
</Link>
```

Release card (a small poster):

```tsx
<article className="grid grid-rows-[auto_1fr_auto] aspect-[4/5] bg-paper text-black">
  <p className="bg-red text-paper px-3 py-2 font-text font-extrabold uppercase tracking-[0.06em] text-[13px]">{type}</p>
  <div className="px-3 py-3.5 grid content-end">{/* square cover art here when there is one */}<h3 className="font-poster font-black uppercase leading-[0.85] text-[46px]">{title}</h3></div>
  <div className="flex justify-between items-center px-3 py-2.5 border-t-[3px] border-black font-text font-semibold text-[13px]"><span>{artist}</span><span>Listen</span></div>
</article>
```

Empty state (an invitation with one action):

```tsx
<div className="bg-black border-[3px] border-dashed border-yellow p-5 grid gap-2.5">
  <p className="font-poster font-extrabold uppercase text-[32px] leading-[0.95] text-paper">No releases yet.</p>
  <p className="font-text text-paper">The first ones are in the studio. Get the drop in your inbox.</p>
  {/* one main button: "Get release news" */}
</div>
```

Studio panel and table (calm: no stripes, no grille, no huge type except money):

```tsx
<div className="bg-panel border border-line overflow-x-auto">
  <table className="w-full min-w-[520px]">
    <thead><tr className="border-b border-line text-left"><th className="px-4 py-3 font-text font-semibold text-[13px] text-muted">Tab</th>…<th className="px-4 py-3 text-right font-text font-semibold text-[13px] text-muted">Total</th></tr></thead>
    <tbody><tr className="border-b border-line"><td className="px-4 py-3 text-paper">{name}</td><td className="px-4 py-3"><span className="bg-green text-paper font-text font-bold text-xs px-2 py-0.5">Open</span></td>…<td className="px-4 py-3 text-right font-poster font-extrabold tabular-nums text-2xl text-yellow">{formatJmd(total)}</td></tr></tbody>
  </table>
</div>
```

Never nest `overflow-hidden` around a scrolling table (it blocks scrolling on iPhone).

Speaker-grille band (beside a photo or along a block edge, never over a photo):

```tsx
<span aria-hidden="true" className="absolute right-0 inset-y-0 w-[60px] bg-black bg-[radial-gradient(circle,var(--color-yellow)_0_4.4px,transparent_4.9px)] bg-[length:18px_18px] bg-[position:4px_4px]" />
```

The radial gradient here only draws hard-edged round holes; it is not a colour fade. The concept faded the bottom of one band with a mask; keep bands solid instead, which matches "flat blocks, no blur".

Speaker rings (draw them as SVG so the rings stay crisp):

```tsx
<svg viewBox="0 0 100 100" className="w-[120px] h-[120px]" aria-hidden="true">
  <circle cx="50" cy="50" r="22" fill="none" stroke="var(--color-black)" strokeWidth="1.3" />
  <circle cx="50" cy="50" r="33" fill="none" stroke="var(--color-black)" strokeOpacity="0.55" strokeWidth="1.3" />
  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-black)" strokeOpacity="0.28" strokeWidth="1.3" />
</svg>
```

Put the flame in the centre at about 40% of the ring size. Use `--color-paper` rings with the light logo on red. On a photo, use dark rings and the light logo on a `bg-black/50 rounded-full` lens inside them.

Corner block:

```tsx
<span className="absolute right-0 top-0 grid place-items-center w-[72px] h-[72px] bg-black">
  <Image src="/brand/flame-light.svg" alt="" width={40} height={46} />
</span>
```

`bg-yellow` with `flame-original.svg` on red cards.

### Three-tone photos

Recommendation: **print photos when they are shown, with an SVG colour filter**, rather than making printed copies when they are uploaded.

- It needs no new software and no change to storage or uploads. The original upload stays untouched.
- One upload works on any block: the same photo prints in yellow on the home hero and in red on the Lounge block.
- It applies to photos already uploaded and to `hero-bg.jpg` at once, so "automatic on upload" holds without anyone editing photos by hand.
- Server-side printing (for example with the Sharp image library) is the better choice only for files that leave the site, such as social posts or link previews. Sharp is present only as a dependency of Next.js today; it is not listed in `package.json`.

Put one hidden SVG with both filters in the public layout, then add `[filter:url(#print-yellow)]` or `[filter:url(#print-red)]` to the photo:

```tsx
<svg width="0" height="0" className="absolute" aria-hidden="true">
  <filter id="print-yellow" colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.059 0.949 0.949 1" />
      <feFuncG type="table" tableValues="0.051 0.761 0.761 0.969" />
      <feFuncB type="table" tableValues="0.043 0.188 0.188 0.902" />
    </feComponentTransfer>
  </filter>
  <filter id="print-red" colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
    <feComponentTransfer>
      <feFuncR type="table" tableValues="0.059 0.784 0.784 1" />
      <feFuncG type="table" tableValues="0.051 0.196 0.196 0.969" />
      <feFuncB type="table" tableValues="0.043 0.122 0.122 0.902" />
    </feComponentTransfer>
  </filter>
</svg>
```

Each table maps dark to `black`, the middle to the block colour and the brightest part to `paper`. Four values (`black`, colour, colour, `paper`) is the middle strength: white appears only in the top third of the tones. Three values (`black`, colour, `paper`) is the brighter version that was not chosen; two values (`black`, colour) is the dim "before". Compare against the concept's sample images by eye, and check on an iPhone in Safari before relying on it. Never add a green filter.

## Components to reuse or replace

All are in `src/components/`.

| Component | What happens in the rebuild |
| --- | --- |
| `PublicHeader`, `PublicFooter` | Restyle: black header with the light horizontal logo and a 4px yellow line; phone `Menu` button. Black footer with the light stacked logo. |
| `SectionHeader` | Replace its eyebrow, title and thin rule with the section opener (headline plus red bar). Drop the `eyebrow` and `dark` props once no page uses them. |
| `ArtistCard` | Replace the ink gradient and hover zoom with the artist tile: initial on a colour block without a photo; three-tone photo, corner block and a black name box with one. |
| `ReleaseCard` | Rebuild as the small-poster release card. |
| `VideoEmbed` | Keep; square corners, and a solid focus ring that does not depend on the thumbnail. |
| `ReleasesFilter`, `VideosFilter` | Keep; square chips with a 2px edge, selected chip in yellow with black text. |
| `ContactForm`, `SubscribeForm`, `SignupForm` | Move every form onto a paper block with 2px black fields and the red focus ring. |
| `InkShell` | Keep the structure; black ground, paper text, line dividers, light logo, new type. Calm rules apply. |
| `MenuGrid`, `AddStockForm`, `InventoryAddRow`, `MenuItemForm` | Restyle only (bar). Bartenders may still only add stock. |
| `ArtistForm`, `ReleaseForm`, `VideoForm`, `NewsForm`, `PortalProfileForm`, `AssetUploadForm`, `AdminAssetUploadForm`, `GenerateCodeForm` | Restyle only (studio screens). |
| `ReleasesManagerFilter`, `ApplicationActions`, `ToastProvider`, `CopyButton`, `LogoutButton`, `ResendInviteButton`, `YoutubeUploadButton` | Restyle only. Status colours move to the chips: green for live and done, red for failed, outlined muted for the rest. The old `status-*` tokens retire with the studio screens. |

## Logo files in the app

The vector files are in `brand/vector/` and `brand/vector/trimmed/`, outside `public/`, so the site cannot serve them yet. Copy the ones the rebuild uses into `public/brand/` unchanged: `flame-original.svg`, `flame-light.svg` and the trimmed `horizontal-*` and `stacked-*` files. Keep `public/logo*.png` until nothing links to them.

## Rules

1. Use the tokens above. Do not add colours, fonts or shadows. If a design truly needs one, add it to `@theme inline` with a comment and to this system. No raw hex in `className`.
2. Square corners: never `rounded-*`, except `rounded-full` for the logo lens, rings and grille holes.
3. No gradients, glows, soft shadows, blur, or `drop-shadow`. The paper grain and the darkened photo overlay go.
4. One `yellow` main button per screen.
5. Headlines at `poster` or `headline` size hold five words or fewer; check it in code and drop to `title`.
6. Forms and long reading sit on `paper`.
7. Every interactive element has a solid 3px focus outline in the colour for its ground. Never `outline-none` without that replacement.
8. Logo: original on yellow or paper; light on black or red; on photos, light in the black 50% lens. Never the original on black or red, never a solid circle.
9. Grille only beside photos or along block edges, never over a photo or behind text.
10. Photos get the three-tone filter for the block they sit on. Never green.
11. Studio screens: black ground, no stripes or grille, yellow only for the one action and money, no huge type except money and counts.
12. Bar money is whole Jamaican dollars. Format with `formatJmd()` and read "today" with `jamaicaMidnight()`, both in `src/lib/bar/pos.ts`.
13. Interactive bits inside a Server Component page go in their own `*Client.tsx` or `*Button.tsx` file.
14. Check every change at phone width (375px). The bar till and the gamer portal are used on phones.

Copy and tone rules are in the brand book's "Voice and content" section and in `knowledge-base/brand-and-voice.md`.
