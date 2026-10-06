# Next session — One Flame Records

> Short, current "pick this up next" brief. Overwrite this each session.
> Full history lives in [`project-memory.md`](./project-memory.md); decisions in
> [`decisions.md`](./decisions.md).

**Where things stand:** Phases 1–5 + Bar POS complete and in production. The 2026-07-16/17
full-site audit shipped all Critical+High fixes. Landed 2026-07-17: public-page caching, admin
count-aggregation RPCs (`1cb2ae1`), the three session-41 code-review bug fixes (`b2855be`),
whole-dollar money display (`b3c20cf`), and bar sales aggregation RPCs verified against prod
(`2d087ed`). Detailed recent history is in `docs/session-handoffs/`.

## Priority 0 — Review, commit and deploy the 2026-10-05 delegated fixes

Uncommitted in the working tree: false About timeline removed, Lounge stock photo
removed, contrast and form-focus fixes. See `docs/session-handoffs/2026-10-05.md`.
After deploy: `curl -s https://www.oneflamerecords.com/about | grep -ci "ten million\|distribution deal"`
should print 0, and the live `/flames-lounge` HTML must not contain `flames-lounge-hero.jpg`.
A real Flames Lounge photo is still needed for the hero.

## Priority 1 — Money: cents → whole dollars — ✅ SHIPPED 2026-08-15

Applied to production with the bar closed, and verified. Sequence run:

1. Backed up to `~/one-flame-backups/` (schema + data; 831 money rows across the
   five tables, counts matched live exactly).
2. `audit-money-precision.mjs` **aborted** on 16 sub-dollar values — the gate did
   its job. Fourteen were derived unit costs (bottle cost ÷ yield). Two were one
   broken discount: a custom item named `-$1000` entered at J$0.10 on the tab
   `Pardie`. Owner decision, same day: round everything to the nearest dollar.
3. `scripts/round-money-to-dollars.mjs --apply` rounded all 16. No value moved by
   more than J$0.25. The gate then reported CLEAN.
4. `verify-money-migration.mjs --snapshot`.
5. `supabase db push --linked` applied `20260809000001_money_cents_to_dollars.sql`
   — the only pending migration.
6. Merged PR #1 to `main`; Vercel production deploy reached Ready.
7. `verify-money-migration.mjs --verify`: every figure identical — 267 tabs, 200
   closed, revenue 134,050, COGS 5,117, profit 128,933, and 0 mismatches at row
   level on both menu rows and tab totals.

Post-deploy spot check: `bar_sales_payment_summary`, `bar_sales_by_category` and
`bar_sales_top_items` all return `_jmd` columns; cash 133,200 + comp 850 = 134,050,
matching the verified revenue.

**Still to do:** walk one live tab end to end in the admin UI — open → add item →
custom item → tip → close — and confirm `/admin/bar/sales` matches. That needs a
browser admin session and has not been done.

**Note on `Pardie`:** rounding took that tab from J$1700.10 to J$1700. The J$1000
discount someone tried to apply was never applied and still is not. If it was
meant, adjust the tab in the POS — it is still open.

## Priority 1b — 17 open tabs, J$66,850

Found while verifying, unrelated to the migration. All 267 tabs balance against
their items, so this is not a data fault — it is money on the books. Oldest is
`Pardie` from 2026-06-22; largest is `Kahleil` at J$25,900.

## Priority 2 — Optional / when wanted

- **Tag-based cache invalidation** — replace the 120s public-page revalidate with `revalidateTag`
  in admin actions (artists/releases/videos/news) for instant content updates.
- **Enter `pos_items.cost_cents`** (owner data entry) — bar profit reads $0 / overstated until
  done; the Sales aggregation is ready to use it the moment costs are entered.

## Priority 3 — Content entry + housekeeping (ongoing, via admin UI)

- Artists / releases / news via `/admin`.
- Set `MAX_CAMPAIGN_IMAGES` env var in the Vercel dashboard.
- Flames Lounge gallery + logo SVGs when owner assets are available.

## Known blockers

- **TikTok auto-posting** — Make.com has no TikTok upload module; manual for now.
- **Flames Lounge gallery / logos** — placeholders; need owner-provided assets.
- **Live admin verification** — no admin creds this session; the count-RPC read path and the
  cache-refresh loop are unproven in a live admin session (low risk — the bar sales RPCs *were*
  verified against prod via the service-role key, and the count RPCs use the same pattern).
