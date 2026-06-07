import { inngest } from "@/lib/inngest/client";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { KieGenerator } from "@/lib/video/providers/kie";
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import path from "path";
import https from "https";

ffmpeg.setFfmpegPath(ffmpegPath);

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function concatClips(clipPaths: string[], outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();
    clipPaths.forEach((p) => cmd.input(p));
    const filterStr = `${clipPaths.map((_, i) => `[${i}:v]`).join("")}concat=n=${clipPaths.length}:v=1:a=0[v]`;
    cmd
      .complexFilter([filterStr])
      .outputOptions(["-map [v]", "-c:v libx264", "-crf 23", "-preset fast"])
      .output(outPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

export const generateCampaignVideo = inngest.createFunction(
  {
    id: "generate-campaign-video",
    triggers: [{ event: "campaign/video.requested" }],
    retries: 1,
    onFailure: async ({ error, event }) => {
      const { pieceId } = (event.data as unknown as { event: { data: { pieceId: string } } }).event.data;
      const supabase = createServiceClient();
      await supabase
        .from("content_pieces")
        .update({ status: "approved", error: `Video generation failed: ${error.message}` })
        .eq("id", pieceId);
    },
  },
  async ({ event, step }) => {
    const { pieceId } = event.data as { pieceId: string };

    // ── Step 1: Load piece ────────────────────────────────────────────────────
    const piece = await step.run("load-piece", async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("content_pieces")
        .select("id, video_script, platform, content_type")
        .eq("id", pieceId)
        .single();
      if (error || !data) throw new Error(`Piece not found: ${pieceId}`);
      if (!data.video_script) throw new Error("Piece has no video script to generate from");
      return data;
    });

    // ── Step 2: Mark as generating ───────────────────────────────────────────
    await step.run("mark-generating", async () => {
      const supabase = createServiceClient();
      await supabase
        .from("content_pieces")
        .update({ status: "generating", error: null })
        .eq("id", pieceId);
    });

    // ── Step 3: Convert script to 3 visual scene prompts ─────────────────────
    const scenes: string[] = await step.run("plan-scenes", async () => {
      const msg = await getAnthropic().messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{
          role: "user",
          content: `Convert this social media video script into 3 visual scene descriptions for AI video generation.
Each description should be vivid, specific, and evoke Jamaican reggae/dancehall culture — warm colours, Montego Bay setting, authentic energy.

Script:
<script>
${piece.video_script}
</script>

Return a raw JSON array of exactly 3 strings. No explanation, no markdown.
Example: ["Close-up of...", "Wide shot of...", "Slow pan across..."]`,
        }],
      });

      const raw = msg.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("")
        .trim();
      const stripped = raw.replace(/```(?:json)?/g, "").trim();
      const parsed: unknown = JSON.parse(stripped.startsWith("[") ? stripped : stripped.slice(stripped.indexOf("[")));
      if (!Array.isArray(parsed)) throw new Error("Claude did not return a scene array");
      return (parsed as string[]).slice(0, 3);
    });

    // ── Step 4: Generate clips via kie.ai ────────────────────────────────────
    const aspectRatio = piece.platform === "tiktok" ? "9:16" : "16:9";
    const kie = new KieGenerator();
    const clipUrls: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const result = await step.run(`generate-clip-${i}`, async () => {
        return kie.generateClip({
          prompt: `${scenes[i]}. Reggae and dancehall culture, Montego Bay Jamaica. Cinematic, warm golden light.`,
          durationSeconds: 5,
          aspectRatio,
        });
      });
      clipUrls.push(result.videoUrl);
    }

    // ── Step 5: Assemble + upload ─────────────────────────────────────────────
    const videoUrl: string = await step.run("assemble-upload", async () => {
      const tmpDir = `/tmp/campaign-${pieceId}`;
      fs.mkdirSync(tmpDir, { recursive: true });

      const clipPaths: string[] = [];
      for (let i = 0; i < clipUrls.length; i++) {
        const dest = path.join(tmpDir, `clip-${i}.mp4`);
        await downloadFile(clipUrls[i], dest);
        clipPaths.push(dest);
      }

      const outPath = path.join(tmpDir, "output.mp4");
      await concatClips(clipPaths, outPath);

      const buffer = fs.readFileSync(outPath);
      const storagePath = `campaign-videos/${pieceId}.mp4`;
      const supabase = createServiceClient();

      const { error: upErr } = await supabase.storage
        .from("public-media")
        .upload(storagePath, buffer, { contentType: "video/mp4", upsert: true });
      if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

      const { data: pub } = supabase.storage.from("public-media").getPublicUrl(storagePath);

      // Cleanup
      fs.rmSync(tmpDir, { recursive: true, force: true });

      return pub.publicUrl;
    });

    // ── Step 6: Update piece ──────────────────────────────────────────────────
    await step.run("update-piece", async () => {
      const supabase = createServiceClient();
      await supabase
        .from("content_pieces")
        .update({ video_url: videoUrl, status: "approved" })
        .eq("id", pieceId);
    });
  }
);
