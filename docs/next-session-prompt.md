# Next session — One Flame Records

> Short, current "pick this up next" brief. Overwrite this each session.
> Full history lives in [`project-memory.md`](./project-memory.md); decisions in
> [`decisions.md`](./decisions.md).

**Where things stand:** Phases 1–5 + Bar POS complete and in production. The 2026-07-16/17
full-site audit shipped all Critical+High fixes; public-page caching and admin count-aggregation
RPCs landed 2026-07-17 (commit `1cb2ae1`). Detailed recent history is in `docs/session-handoffs/`.

## Priority 1 — Fix session-41 code-review bugs (verified STILL OPEN 2026-07-17)

1. `src/app/portal/videos/new/actions.ts:107` — wrap `inngest.send()` in try/catch (a bad
   Inngest key currently inserts a zombie job row and 500s the artist; mirror the admin path).
2. `src/app/admin/jobs/[id]/actions.ts:40` — narrow the `catch {}` to only suppress
   missing-key errors; re-throw everything else so the admin sees real failures.
3. `src/app/admin/jobs/[id]/actions.ts:22` — guard `regenerateClip` against a pre-scenes job
   (no `params.scenes`) silently forking a new scene list.

## Priority 2 — Deferred perf/quality (unblocked, pure code)

- **Bar profit/COGS aggregation RPC** — the all-time Sales query still loads all rows into JS.
  Move to a SUM/GROUP BY RPC, mirroring the 2026-07-17 admin count-RPC pattern
  (`supabase/migrations/20260717000001_admin_count_rpcs.sql`). **Verify the money math against
  prod before shipping.**
- **`game_sessions.price_jmd` → cents** — last remaining break of the "money is cents" invariant.
- **(Optional) tag-based cache invalidation** — replace the 120s public-page revalidate with
  `revalidateTag` in admin actions for instant content updates.

## Priority 3 — Content entry + housekeeping (ongoing, via admin UI)

- Artists / releases / news via `/admin`; enter `pos_items.cost_cents` (bar profit overstated until done).
- Set `MAX_CAMPAIGN_IMAGES` env var in the Vercel dashboard.
- Flames Lounge gallery + logo SVGs when owner assets are available.

## Known blockers

- **TikTok auto-posting** — Make.com has no TikTok upload module; manual for now.
- **Flames Lounge gallery / logos** — placeholders; need owner-provided assets.
- **Live admin verification** — no admin creds this session; the count-RPC read path and the
  cache-refresh loop are both unproven in a live admin session (low risk, logic verified).
