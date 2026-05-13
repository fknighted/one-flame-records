# Phase 3 — QR onboarding + artist portal

**Goal:** New artists can scan the One Flame QR card, fill an application, get approved by admin, and access an ink-themed artist portal where they manage their own profile and upload demos, instrumentals, and reference clips.

**Estimated time:** 3 working days.

**Done when:** A new test artist can complete the entire flow — scan → apply → get approved → log in → edit profile → upload an asset → log out — without anyone touching the database directly.

---

## Task 1 — Signup codes admin

**Do:**
- `/admin/codes` — list of all codes with status (active / rotated), label, created date, rotated date.
- "Generate new" button → creates a new code, marks the previous active one as rotated.
- For each active code, show: the URL (`https://oneflamerecords.com/signup/<code>`), and a QR PNG (generate with `qrcode` library) with a download button.

**Acceptance:**
- Can generate a code and download its QR.
- Rotating creates a new code and marks the old one inactive.
- Inactive codes still appear in the list but greyed out.

---

## Task 2 — Signup page

**Do:**
- `/signup/[code]` — server-side check that the code exists and is active. If not, render a "this link has expired" page.
- Form: stage name, legal name, email, phone (optional), genres (multi-select), socials (Instagram, TikTok, YouTube, Twitter — all optional), message (textarea, "tell us about yourself").
- Cream theme — feels like a label submission form, not a sign-up flow.
- Submit via Server Action → inserts into `signup_applications` with status `pending`, fires a Resend email to admin.
- Success page: "Thanks. We'll be in touch within a few days."

**Acceptance:**
- Submitting creates a row.
- Admin gets an email with the application summary and a link to `/admin/applications/[id]`.
- Submitting via an expired code is blocked.
- Submitting with an email that already has an account is blocked with a helpful message.

---

## Task 3 — Applications review

**Do:**
- `/admin/applications` — list of pending applications, sorted oldest first.
- `/admin/applications/[id]` — full detail view: all fields, links to their socials so you can click out and verify.
- "Approve" button → opens a confirmation modal asking if you want to send the welcome email now.
- On approve:
  - Create an `auth.users` entry with their email (Supabase Admin API).
  - The trigger from Phase 1 creates a `profiles` row.
  - Create an `artists` row with the data from the application; status `active`.
  - Update `profiles.artist_id` to link them.
  - Set `signup_applications.status = 'approved'`, `reviewed_by`, `reviewed_at`.
  - Send a password-reset email via Supabase Auth so they can set their own password.
  - Send a Resend welcome email with the portal URL and what to do first.
- "Reject" button → opens a modal for a short rejection note. Sends a polite rejection email. Sets status, no artist row created.

**Acceptance:**
- Approving a test application creates a usable artist account.
- The artist can complete the password-reset flow and log in.
- The artist lands on `/portal` after login.

---

## Task 4 — Portal layout & dashboard

**Do:**
- `src/app/(portal)/portal/layout.tsx` — ink theme, sidebar nav: Dashboard, Profile, Assets, Videos.
- Logo in ink variant.
- `/portal` — dashboard with welcome message, recent uploads, recent video jobs (Phase 4 placeholder for now), and three big tiles linking to profile, upload assets, request video.
- Middleware extension: `/portal/*` requires logged-in artist (not admin) — admins trying to hit portal get redirected to `/admin`.

**Acceptance:**
- Logged-in artist sees the dashboard.
- Logged-out user is redirected to `/login`.
- Admin user hitting `/portal` is redirected to `/admin`.

---

## Task 5 — Artist profile self-edit

**Do:**
- `/portal/profile` — pre-filled form with the artist's own row from `artists`. Editable fields: `bio`, `photo_url`, `socials`, `streaming`. Read-only: `stage_name`, `slug`, `hometown`, `genres` (the artist asks admin to change these).
- Photo upload to the same bucket as the admin path, but RLS-restricted: artist can only write to their own `photos/{artist_id}/...` prefix.
- Save shows a success toast.

**Acceptance:**
- Artist can edit their bio and it updates on the public site immediately.
- Artist cannot edit fields outside the allowlist (UI doesn't show them, and a malicious PATCH is blocked by RLS).
- Photo upload works and the new photo shows on the public profile.

---

## Task 6 — Asset upload (instrumentals, demos, references)

**Do:**
- `/portal/assets` — list of the artist's own uploaded assets with kind, title, duration, upload date, download link.
- `/portal/assets/new` — upload form: kind (instrumental / demo / reference video / reference image), title, notes, file.
- Direct upload to Supabase Storage via signed URL (don't proxy through Next.js — files can be large).
- After upload, insert the `assets` row.
- Audio files: extract duration server-side via `music-metadata` before saving the row.
- Video files: extract duration via ffprobe (or a service — Phase 3 can keep this lightweight, extend in Phase 4).

**Acceptance:**
- Artist can upload an MP3 and see it in the list with correct duration.
- Artist can upload a reference video.
- Artist cannot see other artists' assets (RLS).
- Download links work and are signed/expire (60 minutes).

---

## Task 7 — Email templates

**Do:**
- `src/lib/email/templates/` — React Email components for: application-received (to admin), application-approved (to artist), application-rejected (to artist), welcome (to newly approved artist).
- All emails use brand colors and the flame mark.
- Plain-text fallbacks.

**Acceptance:**
- All four emails render correctly in Gmail, Apple Mail, and Outlook (test with React Email preview).
- Links in emails go to the right routes.
- Resend dashboard shows deliveries with the right templates.

---

## Task 8 — End-to-end test

**Do:**
- Create a test code in admin.
- Scan the QR (or just open the URL).
- Submit an application with a real email you control.
- Verify the admin notification email arrives.
- Approve in admin.
- Receive the password-reset email.
- Set a password, log in.
- Edit profile (change the bio).
- Verify the public site updates.
- Upload an instrumental.
- Log out.
- Log back in.
- Verify everything persists.

**Acceptance:** All steps complete without manual database intervention.

---

## Phase 3 wrap-up

- Print the QR card with the active code. Hand it to one real artist first as a soft test.
- Update `PROGRESS.md` → Phase 3 complete, Phase 4 next.
- `git tag phase-3-complete && git push --tags`.

Now we have a working onboarding flow and a place for artists to live. Phase 4 turns those uploaded instrumentals into videos.
