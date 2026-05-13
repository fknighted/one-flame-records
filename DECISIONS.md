# Decisions

Append-only log of architectural decisions. Never edit a past entry — write a new one that supersedes it, and link back.

Format for each entry:

```
## YYYY-MM-DD — Short decision title
**Context:** what situation forced this choice
**Decision:** what we're doing
**Alternatives considered:** what we rejected and why
**Consequences:** what this commits us to, good and bad
```

---

## 2026-05-XX — Initial stack: Next.js + Supabase + Vercel + Inngest

**Context:** Greenfield record label platform with public site, gated artist portal, and an automated video pipeline. Need a stack that handles auth, file storage, durable async workflows, and ships fast with a single developer using Claude Code.

**Decision:**
- **Next.js 15 on Vercel** for the app — App Router, Server Components, edge-friendly.
- **Supabase** for Postgres, Auth, Storage, and Row-Level Security in one platform.
- **Inngest** for the video automation pipeline — durable multi-step functions with retries and a built-in dashboard.
- **Resend** for transactional email.
- **GitHub** for source, with Vercel auto-deploy on push to `main`.

**Alternatives considered:**
- _Hostinger VPS + Express + Postgres + Paperclip AI._ Rejected: more infra to manage, no built-in auth/storage/RLS, and Paperclip is being dropped from the toolchain.
- _Firebase._ Rejected: weaker SQL story, less control over auth flows.
- _Custom Node worker on the existing VPS instead of Inngest._ Rejected: would have to build observability, retries, and step state ourselves. Inngest gives us all of that for free up to 50K monthly executions, which is more orchestration than we'll plausibly use.

**Consequences:**
- All long-running AI work goes through Inngest functions, not API route timeouts.
- File uploads route through Supabase Storage with signed URLs.
- Two environments to manage (local Supabase via Docker, hosted Supabase in prod).
- We pay nothing until real volume — Vercel hobby, Supabase free tier, Inngest free tier, Resend free tier all cover Phase 1–3 fully.

---

## 2026-05-XX — Two-theme visual system: cream public, ink portal

**Context:** Brand direction is roots/vintage Studio One homage. But the artist portal and any video-heavy pages need dark backgrounds so media pops. These are in tension.

**Decision:** Build two complementary themes. The public site is cream-dominant (`#ECE2C8` background, oxblood and forest inks, slab-serif headlines, subtle paper grain). The portal and video-rendering pages flip to ink-dark (`#1A1612` background, bone-white text, same oxblood and forest as accents). The logo works natively in both.

**Alternatives considered:**
- _Single cream theme everywhere._ Rejected: video thumbnails and waveforms look weak on cream.
- _Single ink theme everywhere._ Rejected: undersells the Jamaican roots/vintage identity the label wants.

**Consequences:**
- Theme switch is a CSS class on the root layout per route group, not a runtime toggle. No theme picker for users.
- All components must look correct in both themes from the start.
- Logo SVG needs two color variants (already designed).

---

## 2026-05-XX — Reusable QR signup code with admin approval gate

**Context:** Need a frictionless way to onboard signed artists without exposing the signup endpoint to anyone with the URL.

**Decision:** A single reusable signup code is generated in admin and embedded in a QR on a printed business card. Artists scan → fill an application form → account created in `pending` status → admin approves → portal access unlocks. The code is rotatable from admin without redeploying.

**Alternatives considered:**
- _Single-use per-artist tokens._ Rejected as too high-friction for the current 5-artist scale; can revisit if abuse happens.
- _Fully open signup._ Rejected: invites randoms.
- _Email-only invite._ Rejected: less memorable than a physical card the label can hand out at events.

**Consequences:**
- `signup_codes` table needed, with active/inactive state and rotation timestamp.
- Approval workflow lives in admin — Resend sends "application received" and "approved" emails.
- If the QR card gets posted publicly, admin rotates the code from the dashboard.
