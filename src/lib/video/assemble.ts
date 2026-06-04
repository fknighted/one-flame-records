import path from "path";
import fs from "fs/promises";
import os from "os";
import { createServiceClient } from "@/lib/supabase/server";
import type { ClipResult } from "@/lib/video/types";

// Download a URL to a local temp file — returns the file path
async function downloadToTmp(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const filePath = path.join(os.tmpdir(), filename);
  await fs.writeFile(filePath, Buffer.from(await res.arrayBuffer()));
  return filePath;
}

// Run ffmpeg concat + audio mix via fluent-ffmpeg — returns output path
async function runFfmpeg(
  clipPaths: string[],
  audioPath: string,
  outputPath: string,
  trimDurations?: number[]
): Promise<void> {
  const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");
  const ffmpeg = (await import("fluent-ffmpeg")).default;
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  // Build a concat filter: crossfade between each clip pair
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    // Add all video clip inputs
    for (const clip of clipPaths) {
      cmd.input(clip);
    }

    // Add audio input last
    cmd.input(audioPath);

    const n = clipPaths.length;

    // Normalize each clip to consistent fps + pixel format, then concat.
    // Simpler and more reliable than xfade, which requires identical stream
    // properties and precise offset calculations.
    let filterStr = clipPaths
      .map((_, i) => {
        const dur = trimDurations?.[i];
        const trimPart = dur ? `,trim=duration=${dur},setpts=PTS-STARTPTS` : "";
        return `[${i}:v]fps=24,format=yuv420p${trimPart}[v${i}];`;
      })
      .join("");
    filterStr += clipPaths.map((_, i) => `[v${i}]`).join("") + `concat=n=${n}:v=1:a=0[vout];`;
    filterStr += `[${n}:a]aformat=sample_rates=44100:channel_layouts=stereo[aout]`;

    cmd
      .complexFilter(filterStr)
      .outputOptions(["-map [vout]", "-map [aout]", "-c:v libx264", "-preset fast", "-crf 28", "-maxrate 2M", "-bufsize 4M", "-c:a aac", "-b:a 128k", "-movflags +faststart"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

export async function assembleVideo(
  clips: ClipResult[],
  audioUrl: string,
  jobId: string,
  sceneDurations?: number[]
): Promise<string> {
  const tmpDir = os.tmpdir();
  const clipPaths: string[] = [];

  // Download all clips in parallel
  await Promise.all(
    clips.map(async (clip, i) => {
      const p = await downloadToTmp(clip.videoUrl, `clip-${jobId}-${i}.mp4`);
      clipPaths[i] = p;
    })
  );

  const audioPath = await downloadToTmp(audioUrl, `audio-${jobId}.mp3`);
  const outputPath = path.join(tmpDir, `output-${jobId}.mp4`);

  await runFfmpeg(clipPaths, audioPath, outputPath, sceneDurations);

  // Upload to Supabase Storage
  const supabase = createServiceClient();
  const storagePath = `videos/${jobId}.mp4`;
  const fileBuffer = await fs.readFile(outputPath);

  const { error } = await supabase.storage
    .from("generated-videos")
    .upload(storagePath, fileBuffer, { contentType: "video/mp4", upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  // Return a signed URL (valid 7 days)
  const { data: signed } = await supabase.storage
    .from("generated-videos")
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

  if (!signed?.signedUrl) throw new Error("Could not generate signed URL for output video");

  // Clean up tmp files
  await Promise.allSettled([
    ...clipPaths.map((p) => fs.unlink(p)),
    fs.unlink(audioPath),
    fs.unlink(outputPath),
  ]);

  return signed.signedUrl;
}
