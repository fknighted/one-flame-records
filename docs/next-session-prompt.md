# Next session — One Flame Records

> Short, current "pick this up next" brief. Overwrite this each session.
> Full history lives in [`project-memory.md`](./project-memory.md); decisions in
> [`decisions.md`](./decisions.md).

**Where things stand:** Phases 1–5 + Bar POS complete and in production. Two code-review
passes applied. As of session 41 (2026-06-30), three code-review bugs are still open.

## Priority 1 — Fix session-41 code-review bugs

1. `src/app/portal/videos/new/actions.ts:108` — wrap `inngest.send()` in try/catch (a bad
   Inngest key currently inserts a zombie job row and 500s the artist; mirror the admin path).
2. `src/app/admin/jobs/[id]/actions.ts:38` — narrow the `catch {}` to only suppress
   missing-key errors; re-throw everything else so the admin sees real failures.
3. `src/app/admin/jobs/[id]/actions.ts:22` — guard against `!params.scenes?.length` in
   `regenerateClip`; throw a clear error rather than silently forking with a new scene list.

## Priority 2 — Content entry (ongoing, via admin UI)

- Artists with photos → `/admin/artists/new`
- Releases with cover art → `/admin/releases/new`
- First news post → `/admin/news/new`

## Priority 3 — Housekeeping

- Set `MAX_CAMPAIGN_IMAGES` env var in the Vercel dashboard.
- Swap the Flames Lounge gallery placeholder for real venue photos when available.

## Known blockers

- **TikTok auto-posting** — Make.com has no TikTok upload module; manual for now.
- **Flames Lounge gallery** — grid still placeholder.
