import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/server";
import { analyzeAudio } from "@/lib/audio/analyze";
import { generateScenePrompts } from "@/lib/video/prompt-scenes";
import { getClipGenerator } from "@/lib/video";
import { assembleVideo } from "@/lib/video/assemble";
import { sendEmail } from "@/lib/email/send";

type Status = "analyzing" | "prompting" | "generating" | "assembling" | "complete" | "failed";

async function updateJobStatus(jobId: string, status: Status, extra?: Record<string, unknown>) {
  const supabase = createServiceClient();
  await supabase
    .from("video_jobs")
    .update({ status, ...extra })
    .eq("id", jobId);
}

export const generateVideo = inngest.createFunction(
  {
    id: "generate-video",
    triggers: [{ event: "video/generate.requested" }],
    retries: 2,
  },
  async ({ event, step }) => {
    const { jobId } = event.data as { jobId: string };

    // Step 1: Load job and linked asset
    const job = await step.run("load-job", async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("video_jobs")
        .select("*, assets(storage_path, title)")
        .eq("id", jobId)
        .single();
      if (error || !data) throw new Error(`Job not found: ${jobId}`);

      // Generate a signed URL for the source audio
      const asset = data.assets as { storage_path: string; title: string } | null;
      if (!asset) throw new Error("No asset linked to job");

      const { data: signed } = await supabase.storage
        .from("private-assets")
        .createSignedUrl(asset.storage_path, 3600);
      if (!signed?.signedUrl) throw new Error("Could not sign asset URL");

      return { ...data, audioUrl: signed.signedUrl, assetTitle: asset.title };
    });

    await step.run("mark-analyzing", () =>
      updateJobStatus(jobId, "analyzing", { started_at: new Date().toISOString() })
    );

    // Step 2: Analyze audio
    const audioFeatures = await step.run("analyze-audio", () =>
      analyzeAudio(job.audioUrl)
    );

    await step.run("mark-prompting", () => updateJobStatus(jobId, "prompting"));

    // Step 3: Generate scene prompts via Claude
    const params = job.params as {
      stylePreset?: string;
      aspectRatio?: "16:9" | "9:16" | "1:1";
      model?: string;
    };

    const scenes = await step.run("write-prompts", () =>
      generateScenePrompts(audioFeatures, {
        stylePreset: params.stylePreset ?? "Vintage roots reggae performance",
        aspectRatio: params.aspectRatio ?? "16:9",
        genres: [], // artist genres — could be joined from profiles if needed
      })
    );

    await step.run("mark-generating", () => updateJobStatus(jobId, "generating"));

    // Step 4: Generate clips in parallel (one step per scene)
    const clips = await Promise.all(
      scenes.map((scene, i) =>
        step.run(`generate-clip-${i}`, async () => {
          const generator = getClipGenerator(params.model);
          return generator.generateClip({
            prompt: scene.prompt,
            durationSeconds: scene.end - scene.start,
            aspectRatio: scene.aspectRatio,
          });
        })
      )
    );

    await step.run("mark-assembling", () => updateJobStatus(jobId, "assembling"));

    // Step 5: Assemble final video
    const outputUrl = await step.run("assemble", () =>
      assembleVideo(clips, job.audioUrl, jobId)
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
