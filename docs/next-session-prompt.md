# Next session — One Flame Records

> Short, current "pick this up next" brief. Overwrite this each session.
> Full history lives in [`project-memory.md`](./project-memory.md); decisions in
> [`decisions.md`](./decisions.md).

**Where things stand:** Phases 1–5 + Bar POS complete and in production. The 2026-07-16/17
full-site audit shipped all Critical+High fixes. Landed 2026-07-17: public-page caching, admin
count-aggregation RPCs (`1cb2ae1`), the three session-41 code-review bug fixes (`b2855be`),
whole-dollar money display (`b3c20cf`), and bar sales aggregation RPCs verified against prod
(`2d087ed`). Detailed recent history is in `docs/session-handoffs/`.

## Priority 1 — `game_sessions.price_jmd` → cents

Last remaining break of the "money is cents" invariant — the column is stored in whole dollars
and compensated with ×100 shims. Migrate to cents, drop the shims, fix reads/writes. This is a
money change: verify against prod first. The service-role verification-script approach used for
the bar sales RPCs (`scratchpad/verify-bar-sales.mjs` this session) works well — fetch the raw
values, compute the expected result independently, compare.

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
