---
slug: artist-portal
title: Artist portal and saved videos
product: one-flame-records
domain: oneflamerecords.com
audience: customer
intent: [ accounts, artists, portal, video ]
keywords:
  [
    artist portal,
    upload demo,
    upload instrumental,
    request a video,
    my releases,
    artist dashboard
  ]
answers:
  - "What do signed artists get access to?"
  - "How does an artist request a music video?"
  - "Where do artists upload their demos?"
verified: 2026-10-18
confidence: verified
voice_safe: true
sources:
  - src/app/portal/videos/page.tsx
  - src/app/portal/videos/new/page.tsx
  - src/app/portal/videos/[job_id]/page.tsx
  - src/app/portal/videos/[job_id]/actions.ts
  - src/app/(public)/signup/[code]/actions.ts
  - docs/session-handoffs/2026-10-08-total-studio-removal.md
verification_scope: local repository source and dated release evidence; no new live transaction
reviewed: 2026-10-18
review_scope: local repository reconciliation; original verified dates retain their evidence
  scope; no fresh live transaction
---

## Short answer

Artist accounts have a private dashboard, releases, assets, profile and saved-video library. You can watch completed saved videos and manage their visibility. New automatic video requests and the old AI Studio were retired in October 2026.

## Details

The portal retains demos, instrumentals and other supported uploads, profile editing and the artist’s recorded releases. Its Videos area lists completed saved videos; a detail page offers playback and download when a video file is available. Visibility controls remain subject to your account permissions.

The old new-video request address redirects to Saved videos. There is no current scene-generation queue or sixteen-style video-request workflow. Removing those tools did not delete stored songs, videos or database history. The physical recording studio is a separate business service; ask the label about availability.

Artists who are also authorized bar staff can use the Lounge till. Staff access must be assigned by the label. An application is not a signed contract or approved portal account.

## Common questions

**Can I request a new AI music video here?** No. Use the portal for finished saved videos and contact the label about new production work.

**Can I still watch an older video?** Completed saved videos remain in the library if your account can access them and the stored file is available.

**Can anyone create an artist account?** No. Artist applications need label approval; staff permissions are assigned separately.

## Escalate

Contact the label for missing assets, unavailable saved files, incorrect visibility, account access or a request for new recording/video work. Support cannot promise restoration, production capacity or publication.

## Do not say

- Do not promise new automatic video generation, scene styles, a production turnaround or an AI Studio.
- Do not promise every historical job is visible: the library shows completed videos.
- Do not grant account access or publication rights through a chat.
