import path from "path";
import fs from "fs/promises";
import os from "os";
import { createServiceClient } from "@/lib/supabase/server";
import type { ClipResult } from "@/lib/video/types";

async function downloadToTmp(url: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  const filePath = path.join(os.tmpdir(), filename);
  await fs.writeFile(filePath, Buffer.from(await res.arrayBuffer()));
  return filePath;
}

// Download Inter Bold font to /tmp — reused across invocations on the same container
async function ensureFont(): Promise<string> {
  const fontPath = path.join(os.tmpdir(), "InterBold.ttf");
  try { await fs.access(fontPath); return fontPath; } catch {}
  const res = await fetch(
    "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Bold.ttf"
  );
  if (!res.ok) throw new Error(`Font download failed (${res.status})`);
  await fs.writeFile(fontPath, Buffer.from(await res.arrayBuffer()));
  return fontPath;
}

// Escape special characters for ffmpeg drawtext
function escapeDrawtext(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/:/g, "\\:")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function outputSize(ar?: string): { w: number; h: number } {
  if (ar === "9:16") return { w: 720, h: 1280 };
  if (ar === "1:1")  return { w: 1080, h: 1080 };
  return { w: 1280, h: 720 }; // 16:9 default
}

async function runFfmpeg(
  clipPaths: string[],
  audioPath: string,
  outputPath: string,
  trimDurations?: number[],
  titleInfo?: { artistName: string; trackTitle: string },
  aspectRatio?: string
): Promise<void> {
  const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");
  const ffmpeg = (await import("fluent-ffmpeg")).default;
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  const { w, h } = outputSize(aspectRatio);

  // Attempt font download — silently skip title card if it fails
  let fontFile: string | null = null;
  let titleCardActive = false;
  if (titleInfo) {
    try {
      fontFile = await ensureFont();
      titleCardActive = true;
    } catch (e) {
      console.warn("Title card skipped — font unavailable:", e);
    }
  }

  const clipOffset = titleCardActive ? 1 : 0; // title card occupies input 0 when present
  const n = clipPaths.length;
  const audioIdx = clipOffset + n;

  // Build complex filter
  let filterStr = "";

  if (titleCardActive && fontFile && titleInfo) {
    const artist = escapeDrawtext(titleInfo.artistName);
    const track  = escapeDrawtext(titleInfo.trackTitle);
    filterStr +=
      `[0:v]fps=24,format=yuv420p,scale=${w}:${h},` +
      `drawtext=fontfile='${fontFile}':text='${artist}':fontsize=72:fontcolor=0x8B2A1F:x=(w-text_w)/2:y=(h/2)-60:box=0,` +
      `drawtext=fontfile='${fontFile}':text='${track}':fontsize=40:fontcolor=0xF5EDD8:x=(w-text_w)/2:y=(h/2)+20:box=0` +
      `[titlecard];`;
  }

  filterStr += clipPaths
    .map((_, i) => {
      const inputIdx = clipOffset + i;
      const dur = trimDurations?.[i];
      const trimPart = dur ? `,trim=duration=${dur},setpts=PTS-STARTPTS` : "";
      return `[${inputIdx}:v]fps=24,format=yuv420p${trimPart},scale=${w}:${h}[v${i}];`;
    })
    .join("");

  const concatSources = (titleCardActive ? "[titlecard]" : "") +
    clipPaths.map((_, i) => `[v${i}]`).join("");
  const concatCount = n + (titleCardActive ? 1 : 0);

  filterStr += `${concatSources}concat=n=${concatCount}:v=1:a=0[vout];`;
  filterStr += `[${audioIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo[aout]`;

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    if (titleCardActive) {
      cmd.input(`color=c=#1A1612:size=${w}x${h}:duration=3:rate=24`).inputFormat("lavfi");
    }
    for (const clip of clipPaths) cmd.input(clip);
    cmd.input(audioPath);

    cmd
      .complexFilter(filterStr)
      .outputOptions([
        "-map [vout]", "-map [aout]",
        "-c:v libx264", "-preset fast", "-crf 28", "-maxrate 2M", "-bufsize 4M",
        "-c:a aac", "-b:a 128k", "-movflags +faststart",
      ])
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
  sceneDurations?: number[],
  titleInfo?: { artistName: string; trackTitle: string },
  aspectRatio?: string
): Promise<string> {
  const tmpDir = os.tmpdir();
  const clipPaths: string[] = [];

  await Promise.all(
    clips.map(async (clip, i) => {
      const p = await downloadToTmp(clip.videoUrl, `clip-${jobId}-${i}.mp4`);
      clipPaths[i] = p;
    })
  );

  const audioPath = await downloadToTmp(audioUrl, `audio-${jobId}.mp3`);
  const outputPath = path.join(tmpDir, `output-${jobId}.mp4`);

  await runFfmpeg(clipPaths, audioPath, outputPath, sceneDurations, titleInfo, aspectRatio);

  const supabase = createServiceClient();
  const storagePath = `videos/${jobId}.mp4`;
  const fileBuffer = await fs.readFile(outputPath);

  const { error } = await supabase.storage
    .from("generated-videos")
    .upload(storagePath, fileBuffer, { contentType: "video/mp4", upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: signed } = await supabase.storage
    .from("generated-videos")
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

  if (!signed?.signedUrl) throw new Error("Could not generate signed URL for output video");

  await Promise.allSettled([
    ...clipPaths.map((p) => fs.unlink(p)),
    fs.unlink(audioPath),
    fs.unlink(outputPath),
  ]);

  return signed.signedUrl;
}
