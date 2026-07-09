# Operations runbook

How to do the things that come up while running the platform. Keep this up to date as workflows change.

## Adding a new artist (admin path)

1. Log in at `/login` with admin credentials → land at `/admin`.
2. `/admin/artists` → "New artist."
3. Fill stage name (slug auto-generates from it), bio, hometown, genres, socials, streaming links.
4. Upload a press photo (1:1 ratio, 1000×1000 minimum).
5. Status defaults to `active`. Save.

The artist now appears on the public site immediately. To feature them on the homepage, set `featured_order` to a number (lower = higher position).

## Approving a QR signup application

1. The artist scans the QR code, fills the application, hits submit. You get an email via Resend.
2. `/admin/applications` shows pending entries. Open one.
3. Review their socials and the message they left. Cross-check that they're someone you actually want to sign.
4. Click "Approve" → creates an `artists` row, creates a `profiles` row linking their auth user to the artist, sets `signup_applications.status = 'approved'`, sends an approval email with a password-reset link so they can set their portal password.
5. Or "Reject" → sends a polite rejection email. No artist row is created.

## Rotating the QR signup code

If the QR card gets photographed and posted publicly, or you just want a fresh one:

1. `/admin/codes` → "Rotate."
2. The current code is marked inactive (`rotated_at` timestamped). A new code is generated.
3. Download the new QR PNG. Reprint cards.

Old codes never delete — they keep working for any *already-submitted* application but won't accept new ones.

## Publishing a new release

1. `/admin/releases` → "New release."
2. Pick the artist. Fill title, type, release date, description.
3. Upload cover art (1:1, 1500×1500 minimum — needed for Spotify/Apple anyway).
4. Add streaming links (Spotify, Apple, YouTube, SoundCloud, Tidal). Leave blank what doesn't exist yet.
5. Toggle `featured` if it should show on the homepage.
6. Save.

If there's a music video for the release, also add it via `/admin/videos` and link it to the release.

## Adding a video

1. `/admin/videos` → "New video."
2. Pick the artist. Optionally link to a release.
3. Paste the YouTube URL — the system extracts the 11-character ID.
4. Pick kind (music video, lyric, live, behind scenes, generated).
5. Save.

We don't host video files for public viewing. YouTube is the canonical home. The exception is `generated` videos from the Phase 4 pipeline — those live in the `generated-videos` bucket and we render them with a custom player.

## Handling a failed video job

1. `/admin/jobs` shows all jobs with their current status. Click into a failed one.
2. See the error message and which step failed. Click "Open in Inngest" for the full trace.
3. Common failures:
   - **Provider API error** (Kling/Runway down or quota exceeded) → retry the job after the provider recovers.
   - **Audio analysis failed** (corrupted upload) → ask the artist to re-upload the instrumental.
   - **Cost exceeded budget** → bump the budget in admin settings or kill the job.
4. To retry, click "Retry job." Inngest replays from the last successful step, so you don't pay to redo the parts that worked.

## Deploying

Pushing to `main` deploys to production via Vercel. Always preview-deploy first:

1. Work on a branch.
2. Open a PR. Vercel auto-deploys a preview URL.
3. Test on the preview URL. Check both themes (cream and ink) and at least one workflow end-to-end.
4. Merge to `main`. Production deploys in ~90 seconds.

If a deploy breaks production, roll back from the Vercel dashboard — it's a single click to redeploy the previous successful build. Then investigate.

## Backing up the database

Supabase takes daily automated backups on paid plans. On the free tier:

1. From the Supabase dashboard → Database → Backups → "Download backup" weekly.
2. Store the dump in a private location (1Password, Google Drive in the label folder).

Before any destructive migration, take a manual backup first:

```bash
npx supabase db dump --linked --data-only > backups/pre-migration-YYYY-MM-DD.sql
```

## Rotating secrets

If a key leaks (you committed it, a contractor had access, etc.):

1. Rotate at the provider (Supabase, Resend, Inngest, Kling).
2. Update the value in Vercel environment variables (per-environment: production, preview, development).
3. Trigger a redeploy.
4. Update your local `.env.local`.
5. Note the rotation in `decisions.md` with date and reason.

Never rotate just one of the three environments — they fall out of sync and break previews.

## Updating CLAUDE.md and project-memory.md

At the end of every Claude Code session:

- **project-memory.md** — always. Even if nothing shipped, log what was tried and what's blocked.
- **next-session-prompt.md** — refresh with the top priorities for next time.
- **CLAUDE.md** — only when something structural changes (new convention, new top-level folder, new env var added to the required list).
- **decisions.md** — only when an architectural call was made that isn't obvious from the code itself.

This is the project's memory. If three months from now you (or a new contributor) need to understand why something is the way it is, these files are how you find out.
