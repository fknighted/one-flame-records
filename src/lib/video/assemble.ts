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
  outputPath: string
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

    const totalInputs = clipPaths.length;

    // Build xfade filter chain for crossfades
    let filterStr = "";
    let lastOutput = "[0:v]";
    for (let i = 1; i < totalInputs; i++) {
      const outLabel = i === totalInputs - 1 ? "[vout]" : `[v${i}]`;
      filterStr += `${lastOutput}[${i}:v]xfade=transition=fade:duration=0.5:offset=${(i - 1) * 5 + 4.5}${outLabel};`;
      lastOutput = `[v${i}]`;
    }
    // If single clip, just pass through
    if (totalInputs === 1) {
      filterStr = "[0:v]null[vout];";
    }

    // Mix: use original audio track (last input), discard clip audio
    filterStr += `[${totalInputs}:a]aformat=sample_rates=44100:channel_layouts=stereo[aout]`;

    cmd
      .complexFilter(filterStr)
      .outputOptions(["-map [vout]", "-map [aout]", "-c:v libx264", "-preset fast", "-crf 22", "-c:a aac", "-b:a 192k", "-movflags +faststart"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

export async function assembleVideo(
  clips: ClipResult[],
  audioUrl: string,
  jobId: string
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

  await runFfmpeg(clipPaths, audioPath, outputPath);

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
