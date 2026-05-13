# Phase 4 — Video automation

**Goal:** An artist clicks "Generate video" in the portal, picks a style, points at one of their uploaded instrumentals. Minutes later, a music video — synced to the track — appears in their portal, ready to download or post.

**Estimated time:** 5–7 working days (the most ambitious phase, with the most external dependencies).

**Done when:** A real test instrumental produces a watchable 30-second video end-to-end via the production pipeline, with all steps visible in both `/admin/jobs` and the Inngest dashboard, and the artist receives a notification email when it's ready.

**Read first:** `docs/video-pipeline.md` is the architectural reference for this phase.

---

## Task 1 — Inngest setup

**Do:**
- Sign up for Inngest. Create an app for One Flame.
- Install `inngest` and `@inngest/inngest-cli`.
- Create `src/lib/inngest/client.ts` exporting the Inngest client.
- Create `src/app/api/inngest/route.ts` — the webhook handler that serves all registered functions.
- Add env vars (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`) locally and in Vercel.
- Run `npx inngest-cli dev` locally to test.

**Acceptance:**
- A "hello world" function fires when triggered by an event and appears in the local Inngest dashboard.
- Production webhook is reachable from Inngest's servers.

---

## Task 2 — Model-agnostic video provider interface

**Do:**
- Create the types and factory from `docs/video-pipeline.md` § Model-agnostic interface.
- Implement `KlingGenerator` in `src/lib/video/providers/kling.ts` — first real provider.
  - Use Kling's official API or a unified router like fal.ai if simpler.
  - Function takes `ClipOptions`, returns `ClipResult`.
  - Handle their async pattern (submit → poll for status → fetch URL when ready).
- Stub `RunwayGenerator` and `PikaGenerator` with `throw new Error("Not implemented")` so the factory still compiles.

**Acceptance:**
- Calling `getClipGenerator('kling').generateClip(...)` with a real prompt returns a video URL.
- The URL is valid and the video plays.
- Cost estimate is roughly accurate (within 30%).

---

## Task 3 — Audio analysis

**Do:**
- `src/lib/audio/analyze.ts` — takes a path or URL to an audio file, returns:
  ```ts
  {
    bpm: number;
    durationSeconds: number;
    sections: Array<{ start: number; end: number; energy: 'low' | 'mid' | 'high' }>
  }
  ```
- Phase 4 MVP: use `music-metadata` for duration and any embedded tags, then compute crude amplitude-envelope sections by sampling the waveform. Don't chase BPM accuracy in MVP — a rough number is fine.
- If we want better analysis later, swap in `essentia.js` or a Python micro-service. Keep the interface the same.

**Acceptance:**
- Runs on a real MP3 and returns reasonable numbers.
- Sections roughly match the structure of the song (a chorus is louder than a verse).

---

## Task 4 — Scene prompt generation

**Do:**
- `src/lib/video/prompt-scenes.ts` — calls the Anthropic API.
- System prompt establishes the visual direction: roots/vintage Jamaican aesthetic, the artist's style (pull from `artists.genres`), the label's house preferences.
- User prompt provides the audio analysis JSON plus the artist-supplied style parameters (mood, color palette preference, references).
- Output is a JSON array of scenes with `start`, `end`, `prompt`, `aspectRatio`.
- Use Claude's tool/JSON mode for reliable structured output. Validate the response with Zod before passing downstream.

**Acceptance:**
- For a given audio analysis, produces a coherent set of scene prompts that map to the track's structure.
- Total scene duration sums to the track duration.
- Validation catches malformed output and surfaces a useful error.

---

## Task 5 — Video assembly

**Do:**
- `src/lib/video/assemble.ts` — takes clips and the original audio, produces a final MP4.
- Use `ffmpeg` via `fluent-ffmpeg` running on a separate worker (Vercel functions have a 15-min cap and limited CPU — fine for MVP but watch the timeout).
- Concatenate clips with a half-second crossfade.
- Mute the audio from generated clips (some models add ambient audio we don't want).
- Layer the original instrumental as the audio track.
- Export 1080p MP4 with reasonable bitrate.
- Upload to the `generated-videos` bucket. Return the public URL.

**Acceptance:**
- The output video plays cleanly start to finish.
- Audio matches the original track.
- Visible duration matches the prompt-scene sum.

---

## Task 6 — The Inngest function

**Do:**
- Implement `src/lib/inngest/functions/generate-video.ts` exactly as in `docs/video-pipeline.md`.
- Each `step.run` is a small testable function imported from `src/lib/video/` or `src/lib/audio/`.
- After each step, update `video_jobs.status` so the admin dashboard reflects live progress.
- On failure (after retries exhausted), set status to `failed`, store the error, send the artist a "your video couldn't be generated" email.
- On success, send the artist a "your video is ready" email with a portal link.

**Acceptance:**
- Triggering the function with a real `jobId` produces a complete video.
- The Inngest dashboard shows all steps green.
- The job row in Supabase moves through all statuses to `complete`.

---

## Task 7 — Artist-facing UI: request a video

**Do:**
- `/portal/videos/new` — form to start a job.
- Step 1: pick an instrumental from the artist's `assets` (kind = `instrumental`).
- Step 2: style picker — choose one of a few preset directions (e.g. "Vintage roots reggae performance," "Modern dancehall club energy," "Cinematic Caribbean landscape"). Each preset is a stored prompt template that gets passed into the prompt-generation step.
- Step 3: target duration (15s / 30s / 60s — match clip-length sweet spots) and aspect ratio (16:9 horizontal / 9:16 vertical / 1:1 square).
- Step 4: confirm → fires `video/generate.requested` event with the new `video_jobs` row id.

**Acceptance:**
- Submitting kicks off an Inngest run.
- The portal shows the job in `/portal/videos` with live-updating status.
- The artist can navigate away and come back; the status persists.

---

## Task 8 — Artist-facing UI: view results

**Do:**
- `/portal/videos` — list of all the artist's jobs, newest first. Status badge, thumbnail (once complete), title (derived from the instrumental name + date).
- Click into a completed job → video player, download button, "regenerate with tweaks" button (clones the params and creates a new job).
- Failed jobs show the error and a retry button.

**Acceptance:**
- A completed video plays in place.
- Download produces a usable MP4.
- Retry on a failed job spawns a new attempt.

---

## Task 9 — Admin jobs observability

**Do:**
- `/admin/jobs` — list of all video jobs across all artists, sorted by `created_at` desc. Filter by status.
- Per-job detail: full state machine progress, parameters, cost estimate, links to Inngest dashboard.
- Admin can "Kill job" (mark failed, stop further steps) or "Retry job."
- Aggregate stats at the top: jobs this month, total cost this month, success rate.

**Acceptance:**
- Admin can see and intervene on any job.
- The cost-this-month figure matches the sum of `cost_estimate_usd` on completed jobs.

---

## Task 10 — Cost limiter

**Do:**
- Add a `settings` table with a `monthly_video_budget_usd` row (default $100 or whatever fk wants).
- Before kicking off a new job, sum the current month's costs. If the next job's estimated cost would push us over budget, refuse the job and show the artist a "label has paused video generation this month, contact admin" message.
- Admin override: a checkbox on the new-job form (admin only) bypasses the limit.

**Acceptance:**
- Budget enforcement works — exceeding it blocks new jobs.
- Admin can override.
- Budget can be bumped from `/admin/settings`.

---

## Task 11 — End-to-end test with a real instrumental

**Do:**
- Pick one of fk's actual artist instrumentals.
- Run a 30-second job from scratch.
- Watch the Inngest dashboard.
- Verify the email lands.
- Watch the result with fresh eyes — is it actually good enough to post?
- Note what would make it better (better prompts? different model? longer clips? better assembly?). Log in `DECISIONS.md`.

**Acceptance:** A real 30-second music video has been produced end-to-end and either posted publicly or rejected with documented reasons.

---

## Phase 4 wrap-up

- Update `PROGRESS.md` → Phase 4 complete.
- `git tag phase-4-complete && git push --tags`.
- The pipeline is live but not finished. Iteration items go in a new `phases/phase-5-pipeline-iteration.md` once we know what to improve.

What's deliberately out of scope for Phase 4:

- Lower-thirds with artist name / song title.
- Lyric overlay synchronization.
- Multi-shot character consistency across scenes.
- Voice/face replacement.
- Live streaming integrations.

All of those are real upgrades once the basic pipeline is solid. Don't try to build them in Phase 4.
