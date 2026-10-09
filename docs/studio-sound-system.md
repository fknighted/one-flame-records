# Studio screens in the Sound System look: how to restyle a page

For the agents restyling `src/app/admin/**`, `src/app/portal/**`, `src/app/bar/**`, `src/app/gamer/**` and the studio components (forms, `MenuGrid`, `ReleasesManagerFilter` and the rest). Read `design-system/brand-book.md` ("Studio screens", "Controls and states") first. Public-page rules are in `docs/sound-system-foundation.md`; the studio is calmer than the public site, so most public building blocks do **not** belong here.

**Change how a screen looks, never how it works.** Same props, same handlers, same forms, same copy, same data. Class names only, plus the occasional wrapper `div`.

## What is already done

- `InkShell` (top bar, sidebar, phone menu), `LogoutButton` and `ToastProvider` are restyled. The shell root carries `studio-shell bg-black text-paper font-text`, so every page inherits the black ground, paper text and Archivo. Do not set `bg-ink`/`bg-black` again on a page root.
- Login and the three `auth/*` pages are restyled.
- `src/app/studio.css` holds the studio classes below. It is imported by the four studio layouts, `login/page.tsx` and each `auth/*` page. Pages under those layouts get it automatically; do not import it again.
- The classes live in the CSS `components` layer, so a Tailwind utility on the same element wins (`studio-field w-40`, `studio-btn studio-btn-primary w-full`, `studio-card p-0`).

## The calm rules, in one place

- Ground `black`; lifted panels (cards, tables, modals, the till) `panel`. Text `paper`; supporting text `muted`. Dividers `line`.
- **Big Shoulders only for the page title, money and counts.** Everything else is Archivo: section heads, card titles, labels, buttons, tables.
- **Yellow only for the one main action on the screen and for money amounts.** Not for links, tabs, badges, icons, hover states or focus on anything but black ground (the yellow focus ring is the one exception and is required).
- **Green only for small open / live / paid / done / active chips** (and the success strip). Never green text on black (3.0:1).
- Red text on black is 3.6:1, so it is never small text. Errors are a red strip with paper text; destructive buttons are a red edge.
- No stripes, grille, speaker rings, corner blocks, print filters, poster or headline type, colour blocks behind content, gradients, glows, blur or shadows. Square corners. Borders, not shadows.
- No text opacity (`text-paper/60` and friends). Use `muted`. It is 12.2:1 on black and 11.7:1 on panel.
- Nothing under 12px. The old 9 to 11px tracked labels become `studio-label` (12px).
- Tap targets at least 44px (bar staff use phones). Fields 46px. Field text 16px (iPhone zooms on anything smaller).
- Fields sit on paper: a paper-filled box with black text, even on the black ground. The brand book says so, and it reads best at night.

## Mapping table: old class to new

| Old pattern you will meet | New | Notes |
| --- | --- | --- |
| `bg-ink` on a page or section | remove (shell is black) | On a modal or drawer: `bg-panel border border-line`. |
| `bg-ink/60`, `bg-ink/80` overlay, `backdrop-blur-*` | `bg-black/80` | No blur. |
| `text-bone`, `text-bone/80`, `hover:text-bone` | `text-paper`, `hover:text-paper` | |
| `text-bone/70`, `/60`, `/52`, `/50`, `/45`, `/40`, `/35`, `/30` | `text-muted` | `bone/40` and `/30` failed even on the old ground (3.5 and 2.5:1). One supporting colour only. |
| `placeholder:text-bone/*` | drop it | `studio-field` sets the placeholder (black at 70%, 7.2:1). |
| `border-bone/10`, `/8`, `/5`, `/15`, `/20`, `divide-bone/10`, `divide-bone/5` | `border-line`, `divide-line` | Decoration only (1.6:1). Never the only edge of a control. |
| `border-bone/45`, `/30`, `/40`, `/50` on a control | `studio-field` (field) or `studio-btn-secondary` (button) | Those give a real edge. |
| `bg-bone/5` or `bg-bone/3` field with `border-bone/45` and `focus:border-ochre/50` / `focus:outline-ochre` | `studio-field` | Same class for `input`, `select`, `textarea`, `input[type=file]`. Keep `w-*`/`max-w-*`/`min-w-*`. |
| field label (`text-xs uppercase tracking-[0.2em] text-bone/60`) | `studio-field-label` | 14px paper, sentence case. Keep the label text as written. |
| helper text under a field | `studio-hint` | |
| checkbox / radio | add `studio-check` | |
| `bg-bone/5`, `bg-bone/3` card or `rounded-lg border border-bone/10` card | `studio-card` | Drop every `rounded*`. |
| `bg-bone/10` active tab / segmented choice | `bg-raised text-paper border border-muted` (active), `text-muted border border-line hover:text-paper` (inactive) | Add `aria-current` or `aria-pressed` only if already there. |
| `hover:bg-bone/3`, `hover:bg-bone/5` row | `hover:bg-raised` (or `is-link` on a `studio-table` row) | |
| `bg-ochre text-ink hover:bg-ochre/90` button | `studio-btn studio-btn-primary` | **Only the one main action on the screen.** Every other ochre button becomes secondary. |
| `border border-bone/20 text-bone/60 hover:text-bone` button, `bg-bone/10` button | `studio-btn studio-btn-secondary` | Add `studio-btn-sm` inside table rows and tight toolbars (still 44px). |
| `text-ochre hover:text-ochre/80` text link, `hover:text-ochre` | `studio-link` | Paper, underlined. Yellow is not a link colour here. |
| "Cancel", "Back", quiet text buttons | `studio-btn studio-btn-quiet studio-btn-sm` | |
| `text-rose`, `text-red-400`, `hover:text-red-400` delete / revoke button or link | `studio-btn studio-btn-danger studio-btn-sm` | Keep any `confirm()` exactly as is. |
| `text-red-400`, `text-rose`, `text-red-300` error message; `bg-red-900/30`, `bg-oxblood/20` error box | `studio-error` | Paper on red, 5.0:1. Keep `role="alert"` if present. |
| `text-sage` "Saved", `bg-forest/20 text-sage` success message | `studio-success` | Paper on green, 6.0:1. |
| `text-ochre` money; `font-display text-ochre` total; `font-mono` amount | `studio-money` | Yellow, Big Shoulders 24px, even-width figures. In a table cell add `is-num`. For a big total use the stat tile with `is-money`. |
| `text-ochre` that is **not** money (highlight, "new", icon) | `text-paper` or `text-muted` | |
| `font-display` page `h1` | `studio-page-title` | Only one per page. |
| `font-display` `h2` / `h3`, card or panel title | `studio-section-title` | Archivo 800 18px. |
| `font-display` big number (count, total) | `studio-stat-value` (tile) or `studio-count` (table, list) | |
| `font-mono` time, code, id, phone, quantity | `studio-figures` | Archivo with even-width figures. There is no fixed-width font any more. |
| `font-sans` | remove | The shell sets Archivo. |
| `text-[10px]`, `text-[11px]`, `text-[9px]`, `uppercase tracking-[0.15em]`–`[0.28em]` eyebrow | `studio-label` | 12px, 800, tracked 0.06em, muted. |
| `rounded`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-sm` | remove | Square everything. |
| `rounded-full` avatar / dot | remove `rounded-full` (square thumbnail); a status dot becomes a chip with the word | The lens and rings are public-site only. |
| `shadow`, `shadow-lg` | `border border-line` | |
| `bg-forest/20 text-sage`, `bg-forest/15`, `bg-forest` pill ("Live", "Active", "Paid", "Open", "Done", "Approved") | `studio-chip studio-chip-ok` | |
| `bg-oxblood/20 text-rose`, `bg-red-400/15` pill ("Failed", "Rejected", "Overdue", "Banned") | `studio-chip studio-chip-bad` | |
| `bg-ochre/15 text-ochre`, `bg-bone/10 text-bone/60` pill ("Pending", "Draft", "Hidden", "Closed", "Idea", "Mixing") | `studio-chip studio-chip-neutral` | Yellow is reserved, so pending is neutral. |
| notification count badge (`bg-oxblood rounded-full`) | `studio-chip studio-chip-count` | Black on paper. |
| `overflow-x-auto` table box with `border border-bone/10 rounded-lg` | `studio-table-wrap` on the box, `studio-table min-w-[Npx]` on the `table` | Keep the existing `min-w-[Npx]`. Never wrap in `overflow-hidden`. |
| `text-right font-mono` number column | `is-num` on `th` and `td` | |
| "Nothing here yet" `text-bone/40 text-center py-12` | the empty state snippet | Keep the existing words. |
| `bg-cream`, `text-ink`, `text-oxblood` on login-style pages | already done for login/auth | |

### Old `status-*` tokens: map them, do not keep them

They are only used by `src/app/portal/releases/page.tsx` (inline `style={{ backgroundColor: var(--color-status-…) }}`). On the new grounds most still pass contrast, but `tracking` fails on `panel` (4.4:1), and all of them are old-palette ochre, rose and sage tints that the brand book retires ("The old `status-*` tokens retire with the studio screens"). Map by meaning, keep the word:

| Status | New chip |
| --- | --- |
| `live` | `studio-chip studio-chip-ok` |
| `idea`, `pre-prod`, `tracking`, `mixing`, `mastering`, `scheduled` | `studio-chip studio-chip-neutral` |
| (video jobs, retired) `done` / `failed` / `rendering` | `ok` / `bad` / `neutral`, if any survivor still shows them |

Replace the inline `style` with `className`. Leave the `--color-status-*` variables in `globals.css` alone; they are deleted in the final cleanup once no file uses them.

### Public pieces you should not use on studio screens

`SectionHeader`, `PosterHeadline`, `type-poster`, `type-headline`, `type-title`, `section-bar`, `GrilleBand`, `SpeakerRings`, `CornerBlock`, `PrintedPhoto`, `EmptyState` (dashed yellow), the `outline` button variant (yellow edge) and `FIELD_CLASS` (red ring meant for paper ground). `LogoMark` is fine. `type-small`, `type-caption`, `type-body-sm` and `type-label` are fine. `type-money` is the same look as `studio-money` without `white-space: nowrap`.

## Contrast (computed by script, WCAG 2 formula)

Figures come from a script that composites any transparency over its ground and applies the standard formula. Text needs 4.5:1; control edges and focus rings need 3:1.

| Text or mark | On | Contrast | Needed | Used for |
| --- | --- | --- | --- | --- |
| `paper` | `black` / `panel` / `raised` | 18.2 / 17.4 / 14.4:1 | 4.5 | Main text |
| `muted` | `black` / `panel` / `raised` | 12.2 / 11.7 / 9.6:1 | 4.5 | Supporting text, table heads, labels, neutral chip |
| `yellow` | `black` / `panel` / `raised` | 11.6 / 11.1 / 9.2:1 | 4.5 | Money; focus ring |
| `black` | `yellow` | 11.6:1 | 4.5 | Primary button |
| `black` | `paper` | 18.2:1 | 4.5 | Field text; primary button hover |
| `black` at 70% | `paper` | 7.2:1 | 4.5 | Field placeholder |
| `black` | `muted` | 12.2:1 | 4.5 | Secondary button hover |
| `paper` | `green` | 6.0:1 | 4.5 | OK chip, success strip, success toast |
| `paper` | `red` | 5.0:1 | 4.5 | Bad chip, error strip, error toast, danger hover |
| `muted` edge | `black` / `panel` | 12.2 / 11.7:1 | 3 | Secondary button and neutral chip edge |
| `red` edge | `black` / `panel` | 3.6 / 3.5:1 | 3 | Danger button edge only; never small red text |
| `paper` field fill | `black` | 18.2:1 | 3 | The field's edge against the ground |
| `line` | `black` / `panel` | 1.6 / 1.5:1 | (decoration) | Dividers only |

For reference, the old pairs on the old ink ground: `bone/50` 4.7:1, `bone/40` 3.5:1 (fail), `bone/30` 2.5:1 (fail), `bone/10` border 1.3:1. Old status chips on the new black / panel grounds: idea 7.2 / 6.9, pre-prod 7.5 / 7.1, tracking 4.7 / **4.4 (fail)**, mixing 5.9 / 5.5, mastering 5.4 / 5.1, scheduled 6.7 / 6.4, live 5.8 / 5.5:1.

## Snippets

All of these sit inside a studio layout, so the ground is already black. Routes, names and words in the snippets are examples only; keep each page's own routes and copy.

Page title (with an optional line under it and one main action):

```tsx
<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
  <div className="min-w-0">
    <h1 className="studio-page-title">Releases</h1>
    <p className="mt-2 text-[15px] text-muted">{releases.length} in the catalog</p>
  </div>
  <Link href="/admin/releases/new" className="studio-btn studio-btn-primary">New release</Link>
</div>
```

Card:

```tsx
<section className="studio-card">
  <h2 className="studio-section-title">Profile</h2>
  <p className="mt-1 text-[15px] text-muted">What fans see on your artist page.</p>
  <div className="mt-4 space-y-4">{/* fields */}</div>
</section>
```

Stat tiles (count and money):

```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
  <div className="studio-stat">
    <p className="studio-stat-label">Open tabs</p>
    <p className="studio-stat-value">{openTabs}</p>
  </div>
  <div className="studio-stat">
    <p className="studio-stat-label">Sales today</p>
    <p className="studio-stat-value is-money">{formatCents(totalCents)}</p>
  </div>
</div>
```

Table with status and money:

```tsx
<div className="studio-table-wrap">
  <table className="studio-table min-w-[560px]">
    <thead>
      <tr><th>Tab</th><th>Status</th><th>Opened</th><th className="is-num">Total</th><th><span className="sr-only">Actions</span></th></tr>
    </thead>
    <tbody>
      {tabs.map((t) => (
        <tr key={t.id}>
          <td className="[overflow-wrap:anywhere]">{t.name}</td>
          <td><span className="studio-chip studio-chip-ok">Open</span></td>
          <td className="studio-figures text-muted">{jamaicaTime(t.opened_at)}</td>
          <td className="is-num"><span className="studio-money">{formatCents(t.total_cents)}</span></td>
          <td className="is-num"><Link href={`/bar/tabs/${t.id}`} className="studio-btn studio-btn-secondary studio-btn-sm">View</Link></td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

Field (input, select, textarea all take `studio-field`):

```tsx
<div>
  <label htmlFor="stage_name" className="studio-field-label">Stage name</label>
  <input id="stage_name" name="stage_name" defaultValue={artist.stage_name} required className="studio-field" />
  <p className="studio-hint mt-1.5">Shown on the public roster.</p>
</div>

<select id="category" name="category" className="studio-field">…</select>
<textarea id="bio" name="bio" rows={6} className="studio-field" />
<label className="flex items-center gap-3 min-h-[44px]"><input type="checkbox" name="is_published" className="studio-check" /> Published</label>
```

Buttons:

```tsx
<button type="submit" disabled={pending} className="studio-btn studio-btn-primary">{pending ? "Saving…" : "Save"}</button>
<button type="button" onClick={onCancel} className="studio-btn studio-btn-secondary">Cancel</button>
<button type="button" onClick={onDelete} className="studio-btn studio-btn-danger studio-btn-sm">Delete</button>
<button type="button" onClick={onBack} className="studio-btn studio-btn-quiet studio-btn-sm">Back</button>
```

One `studio-btn-primary` per screen. On a page with several forms, the most important submit is primary; the rest are secondary.

Status chips (always the word):

```tsx
<span className="studio-chip studio-chip-ok">Paid</span>
<span className="studio-chip studio-chip-bad">Failed</span>
<span className="studio-chip studio-chip-neutral">Pending</span>
```

Money outside a table:

```tsx
<p className="flex items-baseline justify-between gap-4">
  <span className="text-muted">Balance</span>
  <span className="studio-money">{formatCents(balanceCents)}</span>
</p>
```

Error and success messages (from `useActionState`):

```tsx
{state?.error && <p role="alert" className="studio-error">{state.error}</p>}
{saved && <p className="studio-success">Saved.</p>}
```

Empty state (keep the page's own words):

```tsx
<div className="studio-empty">
  <p className="studio-empty-title">No open tabs.</p>
  <p className="studio-empty-body">Open one when a customer orders.</p>
  <Link href="/bar/tabs/new" className="studio-btn studio-btn-primary mt-2">New tab</Link>
</div>
```

Modal or drawer:

```tsx
<div className="fixed inset-0 z-50 bg-black/80 grid place-items-center p-4">
  <div role="dialog" aria-modal="true" className="studio-card w-full max-w-md">…</div>
</div>
```

## Checks before you hand back

- `grep -nE "bone|ochre|oxblood|forest|sage|rose|ink|cream|font-display|font-mono|rounded|shadow|red-[0-9]|green-[0-9]" <your files>` comes back empty (except `rounded-none` and words inside copy).
- One `studio-btn-primary` per screen; yellow appears only on it and on money.
- Every table is `studio-table-wrap` > `studio-table min-w-[Npx]`, with no `overflow-hidden` around it.
- `npx tsc --noEmit` and `npx eslint <your files>` with no new problems.
- Check at 375px wide: nothing scrolls sideways except inside a table box; every button is at least 44px tall.
