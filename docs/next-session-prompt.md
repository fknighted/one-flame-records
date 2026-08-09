# Next session — One Flame Records

> Short, current "pick this up next" brief. Overwrite this each session.
> Full history lives in [`project-memory.md`](./project-memory.md); decisions in
> [`decisions.md`](./decisions.md).

**Where things stand:** Phases 1–5 + Bar POS complete and in production. The 2026-07-16/17
full-site audit shipped all Critical+High fixes. Landed 2026-07-17: public-page caching, admin
count-aggregation RPCs (`1cb2ae1`), the three session-41 code-review bug fixes (`b2855be`),
whole-dollar money display (`b3c20cf`), and bar sales aggregation RPCs verified against prod
(`2d087ed`). Detailed recent history is in `docs/session-handoffs/`.

## Priority 1 — Money: cents → whole dollars — BUILT, NOT APPLIED

Owner decision 2026-08-09 (`decisions.md`). Code is complete on branch
**`money/cents-to-dollars`**: 11 columns across 5 tables, 6 RPCs, 24 source files.
`tsc --noEmit` clean, `npm run build` passes, no new lint errors (the 7 existing
errors are all in files this branch never touched).

**Nothing has been applied to any database and nothing is deployed.** The branch is
not merged and not pushed. Do not push to `main` casually — push to `main` triggers a
production Vercel deploy, and the deployed code would then disagree with the
unmigrated schema.

### Run it in this order — the bar must be CLOSED

1. **Back up the database.** The migration rewrites money values in place; there is
   no copy of the original cents afterwards.
2. `node scripts/audit-money-precision.mjs` — read-only. Finds any value that isn't a
   whole dollar. **This is the gate.** `CustomItemForm` shipped with `step="0.01"`, so
   a custom item rung up at `$250.50` is stored as `25050`. If the script reports any,
   STOP and decide the rounding rule with Frank — the migration is written to abort on
   them rather than truncate real sales.
3. `node scripts/verify-money-migration.mjs --snapshot` — records expected post-migration
   revenue, tips, COGS, profit, per-item prices and per-tab totals to
   `.money-snapshot.json` (gitignored).
4. Apply `supabase/migrations/20260809000001_money_cents_to_dollars.sql`.
5. Deploy the branch immediately after — schema and code must move together.
6. `node scripts/verify-money-migration.mjs --verify` — proves every figure is
   identical. It checks row-level values too, so a total can't match by luck.
7. Walk one live tab end to end: open → add item → custom item → tip → close, and
   confirm `/admin/bar/sales` matches.

### What changed
- **Columns → `_jmd`:** `pos_items.price/cost`, `pos_tab_items.price/cost`,
  `pos_tabs.total/tip`, `pos_stock_purchases.unit_cost/total_cost/container_cost`,
  `pos_voids.price/cost`.
- **RPCs:** `increment_tab_total`, `decrement_tab_total`, `add_pos_item_stock`
  (param → `p_unit_cost_jmd`), and the three `bar_sales_*` aggregations (return
  columns → `revenue_jmd` / `cost_jmd`).
- **Code:** `formatCents` → `formatJmd`, every ×100 / ÷100 shim deleted. Money inputs
  are `step="1"` and the server parsers now **reject** fractional input instead of
  rounding it.
- **`game_sessions.price_jmd` is unchanged** — it was already dollars. Its display had
  a compensating `* 100` that is now removed; that was the one place the rename alone
  would have inverted a value.

### Watch-outs
- A half-converted state is the dangerous one. Migration and deploy go together.
- `pos_tab_items.cost_jmd` is a **sale-time snapshot** — historical profit is locked to
  it. Never recompute it from current costs.
- A bottle cost that doesn't divide evenly by `bottle_yield` now rounds to the nearest
  dollar per unit, so unit × units can differ slightly from the bottle total. The
  recorded total is authoritative. This is intended.
- Keep `.money-snapshot.json` until step 6 passes.

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
