# One Flame Records

Public label website, artist portal, label administration and Flames Lounge till. Next.js 16 (exact local versions in package.json/lockfile), React 19, Supabase, Resend, Inngest and Vercel. Brand guidance lives in `design-system/README.md`.

Use Node 24, install with `npm ci`, and configure local values from `.env.example` in an ignored environment file. Verify ignore rules before saving secrets.

```sh
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
```

Tests use an isolated in-memory PostgreSQL-compatible engine and mocked providers; they do not write to the live business. The continuous-check workflow runs type checking, lint and tests. Production builds also need the existing environment configuration.

Read `CLAUDE.md` and `node_modules/next/dist/docs/` before implementation. Money is whole Jamaican dollars. Retired AI Studio/gamer screens must stay retired; saved media remains.

October 18 repairs and all five migrations are released. See [release receipt](docs/audits/2026-10-18-release/report.md) for evidence and remaining limits. See [repair report](docs/audits/2026-10-18-repairs/report.md), [operations](docs/operations.md) and [current brief](docs/next-session-prompt.md). Commit, push, hosted migrations and deployment require Frank’s explicit approval.


## November 3 documentation and memory renewal

[Current reconciliation receipt](docs/session-handoffs/2026-11-03-documentation-renewal.md) records the source comparisons, customer-guide corrections and exact limits. Independent acceptance is in the linked root ledger/evidence; this documentation update is not a new release or customer/provider test.
