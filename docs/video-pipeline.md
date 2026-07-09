# Video automation pipeline

Phase 4 deliverable. This doc covers the design — actual code goes in `src/lib/inngest/` and `src/lib/video/`.

## Goal

An artist uploads an instrumental in the portal, picks a few style parameters, hits "Generate." Minutes later, a video shows up in their portal — synced to the track, in a visual style they chose, ready to download or post.

The label admin can watch every job in real time, intervene on failures, and tweak parameters between runs.

## Why Inngest

The work is long-running (multi-minute), multi-step, can fail at any step, and benefits hugely from durability. Inngest handles all of this natively: each step's result is persisted, failures retry independently, and there's a built-in dashboard. We get observability and reliability without building it.

Free tier: 50,000 step executions per month. A typical video job is 10–15 steps. We're not going to hit it.

## Model-agnostic interface

The most expensive mistake we could make in Phase 4 is hard-coding to one video model. Pricing, quality, and capabilities change monthly across Runway, Kling, Pika, Veo, and whatever shows up next. So the pipeline talks to an abstract interface and the concrete implementation is swappable.

```ts
// src/lib/video/types.ts
export interface ClipGenerator {
  name: string;
  generateClip(opts: ClipOptions): Promise<ClipResult>;
}

export interface ClipOptions {
  prompt: string;
  durationSeconds: number;      // typically 5–10
  aspectRatio: '16:9' | '9:16' | '1:1';
  referenceImage?: string;       // optional URL
  seed?: number;
}

export interface ClipResult {
  videoUrl: string;
  durationSeconds: number;
  model: string;                 // e.g. "kling-2.6"
  costEstimateUsd: number;       // for cost tracking
}
```

Implementations: `src/lib/video/providers/kling.ts`, `runway.ts`, `pika.ts`. The orchestrator imports a provider via a factory:

```ts
// src/lib/video/index.ts
export function getClipGenerator(model?: string): ClipGenerator {
  const choice = model ?? process.env.DEFAULT_VIDEO_MODEL ?? 'kling';
  switch (choice) {
    case 'kling':  return new KlingGenerator();
    case 'runway': return new RunwayGenerator();
    case 'pika':   return new PikaGenerator();
    default: throw new Error(`Unknown video model: ${choice}`);
  }
}
```

Start with Kling. It's the cheapest credible option, has the longest max clip length, and as of early 2026 includes synchronized audio generation in Kling 2.6 — which matters because we're literally generating music videos.

## Job state machine

A `video_jobs` row moves through these statuses:

```
queued → analyzing → prompting → generating → assembling → complete
                                                          ↘ failed
```

Each transition happens inside an Inngest function step. If a step fails, Inngest retries it (default 3 attempts with exponential backoff). After exhausting retries, the job is marked `failed` and the artist gets a Resend email.

## Inngest function

```ts
// src/lib/inngest/functions/generate-video.ts
export const generateVideo = inngest.createFunction(
  { id: 'generate-video', name: 'Generate music video' },
  { event: 'video/generate.requested' },
  async ({ event, step }) => {
    const { jobId } = event.data;

    // Step 1: load job + asset, mark analyzing
    const job = await step.run('load-job', () => loadJob(jobId));
    await step.run('mark-analyzing', () => updateJobStatus(jobId, 'analyzing'));

    // Step 2: analyze the audio
    const audioFeatures = await step.run('analyze-audio', () =>
      analyzeAudio(job.source_asset_id)
    );
    // → { bpm, key, energy, sections: [{ start, end, label }] }

    // Step 3: ask Claude for scene-by-scene prompts
    await step.run('mark-prompting', () => updateJobStatus(jobId, 'prompting'));
    const scenes = await step.run('write-prompts', () =>
      generateScenePrompts(audioFeatures, job.params)
    );
    // → [{ start, end, prompt, aspectRatio }]

    // Step 4: generate each clip in parallel (fan-out)
    await step.run('mark-generating', () => updateJobStatus(jobId, 'generating'));
    const clips = await Promise.all(
      scenes.map((scene, i) =>
        step.run(`generate-clip-${i}`, async () => {
          const generator = getClipGenerator(job.params.model);
          return generator.generateClip({
            prompt: scene.prompt,
            durationSeconds: scene.end - scene.start,
            aspectRatio: scene.aspectRatio,
          });
        })
      )
    );

    // Step 5: assemble final video
    await step.run('mark-assembling', () => updateJobStatus(jobId, 'assembling'));
    const finalUrl = await step.run('assemble', () =>
      assembleVideo(clips, job.source_asset_id)
    );

    // Step 6: mark complete + notify
    await step.run('mark-complete', () =>
      completeJob(jobId, finalUrl)
    );
    await step.run('notify-artist', () =>
      sendVideoReadyEmail(job.artist_id, finalUrl)
    );
  }
);
```

Each `step.run` is durable. If the function crashes halfway through, on retry Inngest replays only the steps that didn't complete.

## Audio analysis

For Phase 4 MVP, use a lightweight analysis: BPM detection via a Node library (`music-metadata` for basic info, `essentia.js` or a Python micro-service if we need real beat/section detection). Output is a structured object the prompt-writer can use.

Don't over-engineer this step. Even crude section detection (intro / verse / chorus / outro estimated by amplitude envelope) is enough to make better videos than a single static prompt across the whole track.

## Prompt generation

A Claude API call (using the Anthropic SDK) that takes the audio analysis and the artist's style parameters and returns an array of scene prompts. System prompt establishes the visual direction (the artist's aesthetic, the label's house style if applicable), user prompt provides the structured audio data.

This is the cheapest step in the pipeline and the one most worth iterating on. Better prompts produce better videos than upgrading the video model.

## Assembly

Two paths:

1. **ffmpeg in a Node process.** Cheap, full control, runs on Vercel or a separate worker. Concatenate clips with crossfades, layer the original audio track, render to MP4. For Phase 4 MVP, this is the path.
2. **Creatomate.** Higher quality transitions and templated overlays (label watermark, artist name lower-third). Costs per render. Add later if we want polish.

Output goes to the `generated-videos` Supabase Storage bucket.

## Cost tracking

Every `ClipResult` includes a `costEstimateUsd`. Sum across clips in a job and store on `video_jobs.params.cost_estimate_usd`. The admin jobs dashboard shows per-job cost. Set a monthly budget alert in admin so a bug doesn't burn the credit card.

## Observability

Inngest dashboard is the primary tool — every step, retry, and failure is visible there. The admin `/admin/jobs` page mirrors the high-level state (queued / running / failed / complete) from our own table and links out to the Inngest dashboard for deep dives.

Never write our own retry or queue logic. If Inngest can't do something, that's a signal to use a different orchestrator, not to roll our own.
