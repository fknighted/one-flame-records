import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeAudio } from "@/lib/audio/analyze";
import { transcribeAudio } from "@/lib/audio/transcribe";
import { generateScenePrompts } from "@/lib/video/prompt-scenes";
import type { Scene } from "@/lib/video/prompt-scenes";
import { getClipGenerator } from "@/lib/video";
import { assembleVideo } from "@/lib/video/assemble";
import { sendEmail } from "@/lib/email/send";
import type { ClipResult } from "@/lib/video/types";

type Status = "analyzing" | "prompting" | "generating" | "assembling" | "complete" | "failed";

async function updateJobStatus(jobId: string, status: Status, extra?: Record<string, unknown>) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("video_jobs")
    .update({ status, ...extra })
    .eq("id", jobId);
  if (error) throw new Error(`DB update failed (${status}): ${error.message}`);
}

export const generateVideo = inngest.createFunction(
  {
    id: "generate-video",
    triggers: [{ event: "video/generate.requested" }],
    retries: 2,
    cancelOn: [{ event: "video/cancel.requested", if: "event.data.jobId == async.data.jobId" }],
    onFailure: async ({ error, event }) => {
      const originalData = (event.data as unknown as { event: { data: { jobId: string } } }).event.data;
      await updateJobStatus(originalData.jobId, "failed", { error: error.message });
    },
  },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    // Step 1: Load job and linked asset
    const job = await step.run("load-job", async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*, assets(storage_path, title, notes), artists(stage_name, genres)")
        .eq("id", jobId)
        .single();
      if (error || !data) throw new Error(`Job not found: ${jobId}`);

      // Generate a signed URL for the source audio
      const asset = data.assets as { storage_path: string; title: string; notes: string | null } | null;
      if (!asset) throw new Error("No asset linked to job");

      const { data: signed } = await supabase.storage
        .from("private-assets")
        .createSignedUrl(asset.storage_path, 86400); // 24h — pipeline can run 2+ hours
      if (!signed?.signedUrl) throw new Error("Could not sign asset URL");

      const artistData = data.artists as { stage_name: string; genres: string[] | null } | null;
      const artistName = artistData?.stage_name ?? "One Flame Records";
      const artistGenres = artistData?.genres ?? [];

      return { ...data, audioUrl: signed.signedUrl, assetTitle: asset.title, assetNotes: asset.notes, artistName, artistGenres };
    });

    await step.run("mark-analyzing", () =>
      updateJobStatus(jobId, "analyzing", { started_at: new Date().toISOString() })
    );

    // Step 2: Analyze audio + transcribe in parallel
    const [audioFeatures, transcript] = await Promise.all([
      step.run("analyze-audio", () => analyzeAudio(job.audioUrl)),
      step.run("transcribe-audio", () => transcribeAudio(job.audioUrl)),
    ]);

    await step.run("mark-prompting", () => updateJobStatus(jobId, "prompting"));

    // Step 3: Generate scene prompts via Claude
    const params = job.params as {
      stylePreset?: string;
      aspectRatio?: "16:9" | "9:16" | "1:1";
      model?: string;
      lyrics?: string;
      creativeBrief?: string;
      referenceImageIds?: string[];
      referenceVideoIds?: string[];
      scenes?: Scene[];
    };

    // Load signed URLs for reference images (if any)
    const referenceImageUrls: string[] = [];
    if (params.referenceImageIds?.length) {
      const refUrls = await step.run("load-reference-images", async () => {
        const supabase = createServiceClient();
        const { data: refAssets } = await supabase
          .from("assets")
          .select("id, storage_path")
          .in("id", params.referenceImageIds!);

        const urls: string[] = [];
        for (const asset of refAssets ?? []) {
          const { data: signed } = await supabase.storage
            .from("private-assets")
            .createSignedUrl(asset.storage_path, 86400); // 24h — pipeline can run 2+ hours
          if (signed?.signedUrl) urls.push(signed.signedUrl);
        }
        return urls;
      });
      referenceImageUrls.push(...refUrls);
    }

    // Manual lyrics override auto-transcript
    const lyrics = params.lyrics || transcript || undefined;

    // Load reference video notes to enrich the creative brief
    const refVideoContext = await step.run("load-ref-videos", async () => {
      if (!params.referenceVideoIds?.length) return null;
      const supabase = createServiceClient();
      const { data: refVideos } = await supabase
        .from("assets")
        .select("title, notes")
        .in("id", params.referenceVideoIds);
      if (!refVideos?.length) return null;
      return refVideos.map((v) => `- ${v.title}${v.notes ? `: ${v.notes}` : ""}`).join("\n");
    });

    // Compile enriched creative brief: asset notes + reference video context + manual brief
    const briefParts: string[] = [];
    if (job.assetNotes) briefParts.push(`Track notes: ${job.assetNotes}`);
    if (refVideoContext) briefParts.push(`Reference clips:\n${refVideoContext}`);
    if (params.creativeBrief) briefParts.push(`Director's notes: ${params.creativeBrief}`);
    const enrichedBrief = briefParts.join("\n\n") || undefined;

    // Use pre-approved scenes from params (admin edited them before submitting, or this is
    // a per-clip regeneration retry) — skip Claude generation entirely.
    const scenes: Scene[] = params.scenes?.length
      ? params.scenes
      : await step.run("write-prompts", () =>
          generateScenePrompts(audioFeatures, {
            stylePreset: params.stylePreset ?? "Vintage roots reggae performance",
            aspectRatio: params.aspectRatio ?? "16:9",
            genres: (job.artistGenres as string[] | undefined) ?? [],
            lyrics,
            creativeBrief: enrichedBrief,
            referenceImageUrls: referenceImageUrls.length ? referenceImageUrls : undefined,
          })
        );

    // Persist scenes into params (only needed when we just generated them fresh)
    if (!params.scenes?.length) {
      await step.run("save-scenes", async () => {
        const supabase = createServiceClient();
        const { data } = await supabase.from("video_jobs").select("params").eq("id", jobId).single();
        const cur = (data?.params ?? {}) as Record<string, unknown>;
        const { error } = await supabase
          .from("video_jobs")
          .update({ params: { ...cur, scenes } })
          .eq("id", jobId);
        if (error) throw new Error(`Failed to save scenes: ${error.message}`);
      });
    }

    await step.run("mark-generating", () => updateJobStatus(jobId, "generating"));

    // Clips saved from a previous run (e.g. ran out of credits mid-way).
    // retryJob copies params wholesale, so these carry forward automatically.
    const savedClips = ((params as Record<string, unknown>).generatedClips ?? []) as (ClipResult | null)[];

    // Submit in batches of 5, poll each batch to completion before the next.
    const BATCH_SIZE = 5;
    const clips: ClipResult[] = [];

    for (let batchStart = 0; batchStart < scenes.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, scenes.length);
      const batchSize = batchEnd - batchStart;

      // Submit only clips that weren't saved from a previous run
      const batchTaskIds = await Promise.all(
        Array.from({ length: batchSize }, (_, k) => {
          const i = batchStart + k;
          if (savedClips[i]) return Promise.resolve(null); // already done — skip API call
          return step.run(`submit-clip-${i}`, async () => {
            const generator = getClipGenerator(params.model);

            let referenceImage: string | undefined;
            if (scenes[i].referenceImageId) {
              const supabase = createServiceClient();
              const { data: refAsset } = await supabase
                .from("assets")
                .select("storage_path")
                .eq("id", scenes[i].referenceImageId)
                .single();
              if (refAsset) {
                const { data: signed } = await supabase.storage
                  .from("private-assets")
                  .createSignedUrl(refAsset.storage_path, 3600);
                referenceImage = signed?.signedUrl;
              }
            }

            return generator.submitClip({
              prompt: scenes[i].prompt,
              durationSeconds: scenes[i].end - scenes[i].start,
              aspectRatio: scenes[i].aspectRatio,
              referenceImage,
            });
          });
        })
      );

      // All clips in the batch were submitted simultaneously — wait once for the whole batch
      const anyNewClips = batchTaskIds.some((id) => id !== null);
      if (anyNewClips) await step.sleep(`batch-${batchStart}-initial`, "3m");

      // Build opts array once
      const batchOpts = Array.from({ length: batchSize }, (_, k) => ({
        prompt: scenes[batchStart + k].prompt,
        durationSeconds: scenes[batchStart + k].end - scenes[batchStart + k].start,
        aspectRatio: scenes[batchStart + k].aspectRatio,
      }));

      // Poll all clips in parallel on each attempt — much faster than sequential
      for (let attempt = 0; attempt < 60; attempt++) {
        const pollResults = await Promise.all(
          Array.from({ length: batchSize }, (_, k) => {
            const i = batchStart + k;
            if (savedClips[i] != null) return Promise.resolve(null); // already done
            return step.run(`clip-${i}-poll-${attempt}`, async () => {
              const generator = getClipGenerator(params.model);
              return generator.checkClip(batchTaskIds[k]!, batchOpts[k]);
            });
          })
        );

        // Save any clips that just completed
        for (let k = 0; k < batchSize; k++) {
          const i = batchStart + k;
          if (savedClips[i] != null || pollResults[k] === null) continue;
          const poll = pollResults[k]!;
          if (!poll.done) continue;

          const result = poll.result;
          await step.run(`save-clip-${i}`, async () => {
            const supabase = createServiceClient();
            const { data } = await supabase
              .from("video_jobs").select("params").eq("id", jobId).single();
            const cur = (data?.params ?? {}) as Record<string, unknown>;
            const updated = [...((cur.generatedClips as (ClipResult | null)[]) ?? [])];
            updated[i] = result;
            const { error } = await supabase
              .from("video_jobs")
              .update({ params: JSON.parse(JSON.stringify({ ...cur, generatedClips: updated })) })
              .eq("id", jobId);
            if (error) throw new Error(`Failed to save clip ${i}: ${error.message}`);
          });
          savedClips[i] = result;
        }

        // Done if all clips are saved
        const allDone = Array.from({ length: batchSize }, (_, k) => savedClips[batchStart + k] != null).every(Boolean);
        if (allDone) break;

        if (attempt === 59) throw new Error(`Clips timed out after 30 min`);
        await step.sleep(`batch-${batchStart}-gap-${attempt}`, "30s");
      }

      // Collect results for this batch
      for (let k = 0; k < batchSize; k++) {
        const i = batchStart + k;
        if (!savedClips[i]) throw new Error(`Clip ${i} missing after poll loop`);
        clips.push(savedClips[i]!);
      }
    }

    await step.run("mark-assembling", () => updateJobStatus(jobId, "assembling"));

    // Step 5: Assemble final video
    const outputUrl = await step.run("assemble", () =>
      assembleVideo(
        clips,
        job.audioUrl,
        jobId,
        scenes.map(s => s.end - s.start),
        { artistName: job.artistName as string, trackTitle: job.assetTitle },
        (params.aspectRatio as string) ?? "16:9"
      )
    );

    // Step 6: Mark complete — store output URL, timing, and actual cost
    const totalCostUsd = clips.reduce((sum, c) => sum + c.costEstimateUsd, 0);

    await step.run("mark-complete", () =>
      updateJobStatus(jobId, "complete", {
        output_url: outputUrl,
        completed_at: new Date().toISOString(),
        cost_estimate_usd: totalCostUsd,
      })
    );

    await step.run("notify-artist", async () => {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com";
      const portalUrl = `${siteUrl}/portal/videos`;

      // Get artist email
      const supabase = createServiceClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, artists(stage_name)")
        .eq("artist_id", job.artist_id)
        .single();

      const { data: authUser } = await supabase.auth.admin.getUserById(
        profile?.id ?? ""
      );
      const email = authUser?.user?.email;
      const stageName = (profile?.artists as { stage_name: string } | null)?.stage_name ?? "Artist";

      if (email) {
        await sendEmail({
          to: email,
          subject: "Your One Flame video is ready",
          html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#1A1612;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1A1612;border:1px solid rgba(245,237,216,0.1);border-radius:8px;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3F5A3A;font-family:Arial,sans-serif;">One Flame Records</p>
          <h1 style="margin:0 0 8px;font-size:28px;color:#F5EDD8;">Your video is ready, ${stageName}.</h1>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:rgba(245,237,216,0.7);">
            "${job.assetTitle}" has been turned into a music video. Head to your portal to watch and download it.
          </p>
          <a href="${portalUrl}" style="display:inline-block;background:#B8893B;color:#1A1612;text-decoration:none;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
            View Your Video
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
          text: `Your video is ready, ${stageName}.\n\n"${job.assetTitle}" has been turned into a music video.\n\nView it here: ${portalUrl}`,
        });
      }
    });

    return { jobId, outputUrl };
  }
);
