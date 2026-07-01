import path from "path";
import fs from "fs/promises";
import os from "os";
import { createServiceClient } from "@/lib/supabase/server";
import { getBrandClipUrls } from "@/lib/video/brand";
import type { ClipResult } from "@/lib/video/types";

const INTRO_DURATION = 5; // seconds — used for FFmpeg-generated fallback intro card
const OUTRO_DURATION = 4; // seconds — used for FFmpeg-generated fallback outro card

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

// Build the drawtext chain for a generated intro card:
//   Line 1: ONE FLAME RECORDS (oxblood, large)
//   Line 2: PRESENTS          (ochre, small)
//   Line 3: {artistName}      (bone, large)
//   Line 4: {trackTitle}      (bone, medium)
function introDrawtext(fontFile: string, artistName: string, trackTitle: string): string {
  const a = escapeDrawtext(artistName);
  const t = escapeDrawtext(trackTitle);
  return (
    `drawtext=fontfile='${fontFile}':text='ONE FLAME RECORDS':fontsize=52:fontcolor=0x8B2A1F:x=(w-text_w)/2:y=(h*0.22):box=0,` +
    `drawtext=fontfile='${fontFile}':text='PRESENTS':fontsize=24:fontcolor=0xB8893B:x=(w-text_w)/2:y=(h*0.34):box=0,` +
    `drawtext=fontfile='${fontFile}':text='${a}':fontsize=56:fontcolor=0xF5EDD8:x=(w-text_w)/2:y=(h*0.50):box=0,` +
    `drawtext=fontfile='${fontFile}':text='${t}':fontsize=36:fontcolor=0xF5EDD8:x=(w-text_w)/2:y=(h*0.64):box=0`
  );
}

// Build the drawtext chain for a generated outro card:
//   Line 1: ONE FLAME RECORDS  (oxblood, large)
//   Line 2: oneflamerecords.com (bone, small)
function outroDrawtext(fontFile: string): string {
  return (
    `drawtext=fontfile='${fontFile}':text='ONE FLAME RECORDS':fontsize=56:fontcolor=0x8B2A1F:x=(w-text_w)/2:y=(h*0.38):box=0,` +
    `drawtext=fontfile='${fontFile}':text='oneflamerecords.com':fontsize=28:fontcolor=0xF5EDD8:x=(w-text_w)/2:y=(h*0.54):box=0`
  );
}

async function runFfmpeg(opts: {
  introPath: string | null;       // pre-recorded clip, or null → generate via FFmpeg
  clipPaths: string[];
  audioPath: string;
  outputPath: string;
  trimDurations?: number[];
  titleInfo?: { artistName: string; trackTitle: string };
  outroPath: string | null;       // pre-recorded clip, or null → generate via FFmpeg
  aspectRatio?: string;
}): Promise<void> {
  const { introPath, clipPaths, audioPath, outputPath, trimDurations, titleInfo, outroPath, aspectRatio } = opts;

  const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");
  const ffmpeg = (await import("fluent-ffmpeg")).default;
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  const { w, h } = outputSize(aspectRatio);

  // Decide whether to use generated (drawtext) cards for intro/outro.
  // If a pre-recorded clip is provided, use it; otherwise fall back to FFmpeg generation
  // (which requires the font and titleInfo).
  let fontFile: string | null = null;
  const needFont = (!introPath && !!titleInfo) || !outroPath;
  if (needFont) {
    try { fontFile = await ensureFont(); } catch (e) {
      console.warn("Intro/outro cards skipped — font unavailable:", e);
    }
  }

  const useGeneratedIntro = !introPath && !!titleInfo && !!fontFile;
  const useGeneratedOutro = !outroPath && !!fontFile;

  // Input index map:
  //   0            → intro (file or lavfi source)
  //   1 .. N       → content clips
  //   N+1          → outro (file or lavfi source)
  //   N+2          → audio
  const n = clipPaths.length;
  const audioIdx = 1 + n + 1; // intro + clips + outro + audio

  let filterStr = "";

  // ── Intro filter ──────────────────────────────────────────────────────────
  if (introPath) {
    // Pre-recorded clip: scale/pad to target resolution
    filterStr +=
      `[0:v]fps=24,format=yuv420p,` +
      `scale=${w}:${h}:force_original_aspect_ratio=decrease,` +
      `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2[intro];`;
  } else if (useGeneratedIntro && fontFile && titleInfo) {
    filterStr +=
      `[0:v]fps=24,format=yuv420p,scale=${w}:${h},` +
      introDrawtext(fontFile, titleInfo.artistName, titleInfo.trackTitle) +
      `[intro];`;
  } else {
    // No intro at all — still consume the lavfi source so input indices stay consistent.
    // We'll just pass it through and zero-duration trim below won't apply; we handle
    // this by not including [intro] in the concat.
    filterStr += `[0:v]fps=24,format=yuv420p,scale=${w}:${h}[intro];`;
  }

  // ── Content clip filters ──────────────────────────────────────────────────
  filterStr += clipPaths
    .map((_, i) => {
      const inputIdx = 1 + i;
      const dur = trimDurations?.[i];
      const trimPart = dur ? `,trim=duration=${dur},setpts=PTS-STARTPTS` : "";
      return `[${inputIdx}:v]fps=24,format=yuv420p${trimPart},scale=${w}:${h}[v${i}];`;
    })
    .join("");

  // ── Outro filter ──────────────────────────────────────────────────────────
  const outroInputIdx = 1 + n;
  if (outroPath) {
    filterStr +=
      `[${outroInputIdx}:v]fps=24,format=yuv420p,` +
      `scale=${w}:${h}:force_original_aspect_ratio=decrease,` +
      `pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2[outro];`;
  } else if (useGeneratedOutro && fontFile) {
    filterStr +=
      `[${outroInputIdx}:v]fps=24,format=yuv420p,scale=${w}:${h},` +
      outroDrawtext(fontFile) +
      `[outro];`;
  } else {
    filterStr += `[${outroInputIdx}:v]fps=24,format=yuv420p,scale=${w}:${h}[outro];`;
  }

  // ── Concat ────────────────────────────────────────────────────────────────
  const concatSources =
    `[intro]` +
    clipPaths.map((_, i) => `[v${i}]`).join("") +
    `[outro]`;
  const concatCount = 1 + n + 1; // intro + clips + outro

  filterStr += `${concatSources}concat=n=${concatCount}:v=1:a=0[vout];`;
  filterStr += `[${audioIdx}:a]aformat=sample_rates=44100:channel_layouts=stereo[aout]`;

  return new Promise((resolve, reject) => {
    const cmd = ffmpeg();

    // Input 0: intro
    if (introPath) {
      cmd.input(introPath);
    } else {
      cmd
        .input(`color=c=#1A1612:size=${w}x${h}:duration=${INTRO_DURATION}:rate=24`)
        .inputFormat("lavfi");
    }

    // Inputs 1..N: content clips
    for (const clip of clipPaths) cmd.input(clip);

    // Input N+1: outro
    if (outroPath) {
      cmd.input(outroPath);
    } else {
      cmd
        .input(`color=c=#1A1612:size=${w}x${h}:duration=${OUTRO_DURATION}:rate=24`)
        .inputFormat("lavfi");
    }

    // Input N+2: audio
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

  // Download content clips and check brand settings in parallel
  const [brandUrls] = await Promise.all([
    getBrandClipUrls(),
    Promise.all(
      clips.map(async (clip, i) => {
        const p = await downloadToTmp(clip.videoUrl, `clip-${jobId}-${i}.mp4`);
        clipPaths[i] = p;
      })
    ),
  ]);

  const audioPath = await downloadToTmp(audioUrl, `audio-${jobId}.mp3`);

  // Download brand clips if configured
  let introPath: string | null = null;
  let outroPath: string | null = null;

  if (brandUrls.introUrl) {
    try {
      introPath = await downloadToTmp(brandUrls.introUrl, `brand-intro-${jobId}.mp4`);
    } catch (e) {
      console.warn("Brand intro clip download failed, falling back to generated card:", e);
    }
  }
  if (brandUrls.outroUrl) {
    try {
      outroPath = await downloadToTmp(brandUrls.outroUrl, `brand-outro-${jobId}.mp4`);
    } catch (e) {
      console.warn("Brand outro clip download failed, falling back to generated card:", e);
    }
  }

  const outputPath = path.join(tmpDir, `output-${jobId}.mp4`);

  await runFfmpeg({
    introPath,
    clipPaths,
    audioPath,
    outputPath,
    trimDurations: sceneDurations,
    titleInfo,
    outroPath,
    aspectRatio,
  });

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
    introPath ? fs.unlink(introPath) : Promise.resolve(),
    outroPath ? fs.unlink(outroPath) : Promise.resolve(),
  ]);

  return signed.signedUrl;
}
