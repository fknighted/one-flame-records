"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  generateImage,
  getArtistReferenceImages,
  applyImageToArtist,
  applyImageToRelease,
  applyImageToNews,
  type ReferenceImage,
} from "./actions";

type Artist  = { id: string; stage_name: string };
type Release = { id: string; title: string };
type Post    = { id: string; title: string };

const PURPOSES = [
  { value: "artist_photo",  label: "Artist Photo" },
  { value: "release_cover", label: "Release Cover" },
  { value: "news_cover",    label: "News Cover" },
  { value: "standalone",    label: "Standalone" },
] as const;
type Purpose = typeof PURPOSES[number]["value"];

const STYLES = [
  { value: "photorealistic", label: "Photorealistic" },
  { value: "cinematic",      label: "Cinematic" },
  { value: "illustrated",    label: "Illustrated" },
  { value: "reggae_vintage", label: "Reggae / Vintage" },
];

const SIZES = [
  { value: "square",    label: "Square 1:1",      desc: "1024 × 1024" },
  { value: "landscape", label: "Landscape 16:9",  desc: "1536 × 1024" },
  { value: "portrait",  label: "Portrait 9:16",   desc: "1024 × 1536" },
];

const STYLE_SUFFIXES: Record<string, string> = {
  photorealistic: "photorealistic, high resolution, professional photography",
  cinematic:      "cinematic lighting, film still, moody atmosphere",
  illustrated:    "digital illustration, stylized, bold colors",
  reggae_vintage: "reggae aesthetic, vintage Jamaican style, warm tones, retro feel",
};

function buildPrompt(purpose: Purpose, style: string, name: string, notes: string): string {
  const suffix = STYLE_SUFFIXES[style] ?? "";
  let base = "";
  if (purpose === "artist_photo") {
    base = name
      ? `Professional portrait photo of reggae/dancehall artist "${name}" from Jamaica`
      : "Professional portrait photo of a reggae/dancehall artist from Jamaica";
  } else if (purpose === "release_cover") {
    base = name
      ? `Album cover art for reggae/dancehall release "${name}"`
      : "Album cover art for a reggae/dancehall release";
  } else if (purpose === "news_cover") {
    base = "Editorial news cover image for a Jamaican reggae music label";
  } else {
    base = "Promotional image for One Flame Records, a Jamaican reggae/dancehall label";
  }
  const extra = notes.trim() ? `. ${notes.trim()}` : "";
  return `${base}${extra}. ${suffix}`.trim();
}

const INPUT = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1.5";

type RefMode = "none" | "artist" | "upload";
type SelectedRef =
  | { mode: "none" }
  | { mode: "artist"; path: string; previewUrl: string; title: string }
  | { mode: "upload"; file: File; previewUrl: string };

export default function ImageGeneratorForm({
  artists,
  releases,
  posts,
}: {
  artists: Artist[];
  releases: Release[];
  posts: Post[];
}) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const initPurpose = (searchParams.get("purpose") ?? "standalone") as Purpose;
  const initName    = searchParams.get("name") ?? "";
  const returnUrl   = searchParams.get("return") ?? "";

  const [purpose, setPurpose] = useState<Purpose>(initPurpose);
  const [style,   setStyle]   = useState("photorealistic");
  const [size,    setSize]    = useState("square");
  const [name,    setName]    = useState(initName);
  const [notes,   setNotes]   = useState("");
  const [prompt,  setPrompt]  = useState(() => buildPrompt(initPurpose, "photorealistic", initName, ""));

  // Reference image state
  const [refMode,     setRefMode]     = useState<RefMode>("none");
  const [refArtistId, setRefArtistId] = useState("");
  const [refImages,   setRefImages]   = useState<ReferenceImage[]>([]);
  const [refLoading,  setRefLoading]  = useState(false);
  const [selectedRef, setSelectedRef] = useState<SelectedRef>({ mode: "none" });

  // Output state
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [genError,     setGenError]     = useState<string | null>(null);
  const [applyError,   setApplyError]   = useState<string | null>(null);
  const [applyTarget,  setApplyTarget]  = useState("");
  const [applied,      setApplied]      = useState(false);

  const [generating, startGenerating] = useTransition();
  const [applying,   startApplying]   = useTransition();

  function refreshPrompt(p: Purpose, st: string, n: string, nt: string) {
    setPrompt(buildPrompt(p, st, n, nt));
  }

  function handlePurpose(p: Purpose) {
    setPurpose(p);
    setName("");
    setApplyTarget("");
    setApplied(false);
    refreshPrompt(p, style, "", notes);
  }

  async function handleRefArtist(artistId: string) {
    setRefArtistId(artistId);
    setRefImages([]);
    setSelectedRef({ mode: "none" });
    if (!artistId) return;
    setRefLoading(true);
    const imgs = await getArtistReferenceImages(artistId);
    setRefImages(imgs);
    setRefLoading(false);
  }

  function handleRefUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedRef({ mode: "upload", file, previewUrl: URL.createObjectURL(file) });
  }

  function handleRefMode(m: RefMode) {
    setRefMode(m);
    setSelectedRef({ mode: "none" });
    setRefImages([]);
    setRefArtistId("");
  }

  function handleGenerate() {
    setGenError(null);
    setGeneratedUrl(null);
    setApplied(false);

    const fd = new FormData();
    fd.set("prompt", prompt);
    fd.set("size",   size);

    if (selectedRef.mode === "artist") {
      fd.set("reference_mode",       "asset");
      fd.set("reference_asset_path", selectedRef.path);
    } else if (selectedRef.mode === "upload") {
      fd.set("reference_mode",  "upload");
      fd.set("reference_image", selectedRef.file);
    } else {
      fd.set("reference_mode", "none");
    }

    startGenerating(async () => {
      const result = await generateImage(fd);
      if (result.error) setGenError(result.error);
      else setGeneratedUrl(result.url ?? null);
    });
  }

  function handleApply() {
    if (!generatedUrl || !applyTarget) return;
    setApplyError(null);
    startApplying(async () => {
      let res: { error?: string } = {};
      if (purpose === "artist_photo")  res = await applyImageToArtist(generatedUrl, applyTarget);
      if (purpose === "release_cover") res = await applyImageToRelease(generatedUrl, applyTarget);
      if (purpose === "news_cover")    res = await applyImageToNews(generatedUrl, applyTarget);
      if (res.error) { setApplyError(res.error); return; }
      setApplied(true);
      if (returnUrl) setTimeout(() => router.push(returnUrl), 800);
    });
  }

  const showApplyTarget = purpose !== "standalone";
  const applyOptions =
    purpose === "artist_photo"  ? artists.map(a  => ({ id: a.id,  label: a.stage_name })) :
    purpose === "release_cover" ? releases.map(r  => ({ id: r.id,  label: r.title }))      :
    purpose === "news_cover"    ? posts.map(p     => ({ id: p.id,  label: p.title }))       : [];

  const activeRefPreview =
    selectedRef.mode !== "none" ? selectedRef.previewUrl : null;

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Purpose */}
      <div>
        <label className={LABEL}>Purpose</label>
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => handlePurpose(value)}
              className={`rounded px-3.5 py-1.5 text-sm transition-colors border ${
                purpose === value
                  ? "bg-ochre text-ink border-ochre font-medium"
                  : "border-bone/15 text-bone/60 hover:border-bone/30 hover:text-bone"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Name context */}
      {purpose !== "standalone" && purpose !== "news_cover" && (
        <div>
          <label className={LABEL}>
            {purpose === "artist_photo" ? "Artist name (prompt context)" : "Release title (prompt context)"}
          </label>
          <input
            className={INPUT}
            value={name}
            onChange={e => { setName(e.target.value); refreshPrompt(purpose, style, e.target.value, notes); }}
            placeholder={purpose === "artist_photo" ? "e.g. Chronixx" : "e.g. Jungle Riddim Vol. 1"}
          />
        </div>
      )}

      {/* Style */}
      <div>
        <label className={LABEL}>Style</label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => { setStyle(value); refreshPrompt(purpose, value, name, notes); }}
              className={`rounded px-3.5 py-1.5 text-sm transition-colors border ${
                style === value
                  ? "bg-bone/15 text-bone border-bone/30 font-medium"
                  : "border-bone/10 text-bone/50 hover:border-bone/20 hover:text-bone/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className={LABEL}>Size</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(({ value, label, desc }) => (
            <button key={value} type="button" onClick={() => setSize(value)}
              className={`rounded px-3.5 py-1.5 text-sm transition-colors border ${
                size === value
                  ? "bg-bone/15 text-bone border-bone/30 font-medium"
                  : "border-bone/10 text-bone/50 hover:border-bone/20 hover:text-bone/70"
              }`}
            >
              {label}
              <span className="ml-1.5 text-[10px] opacity-50">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Reference Image ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div>
          <label className={LABEL}>Reference image (optional)</label>
          <p className="text-[11px] text-bone/30 mb-2">
            When provided, the AI uses it as visual guidance — style, composition, or likeness.
          </p>
          <div className="flex gap-2">
            {(["none", "artist", "upload"] as RefMode[]).map((m) => (
              <button key={m} type="button" onClick={() => handleRefMode(m)}
                className={`rounded px-3.5 py-1.5 text-sm transition-colors border capitalize ${
                  refMode === m
                    ? "bg-bone/15 text-bone border-bone/30 font-medium"
                    : "border-bone/10 text-bone/50 hover:border-bone/20 hover:text-bone/70"
                }`}
              >
                {m === "none" ? "None" : m === "artist" ? "From Artist" : "Upload"}
              </button>
            ))}
          </div>
        </div>

        {/* From artist */}
        {refMode === "artist" && (
          <div className="space-y-3 pl-1">
            <select
              value={refArtistId}
              onChange={e => handleRefArtist(e.target.value)}
              className={INPUT + " bg-ink"}
            >
              <option value="">Select artist…</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.stage_name}</option>
              ))}
            </select>

            {refLoading && (
              <p className="text-xs text-bone/40">Loading reference images…</p>
            )}

            {!refLoading && refArtistId && refImages.length === 0 && (
              <p className="text-xs text-bone/40">
                No reference images for this artist. Upload one under{" "}
                <span className="text-bone/60">Artists → Assets</span> with kind "Reference Image".
              </p>
            )}

            {refImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {refImages.map(img => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedRef({ mode: "artist", path: img.storage_path, previewUrl: img.signed_url, title: img.title })}
                    className={`relative aspect-square rounded overflow-hidden border-2 transition-colors ${
                      selectedRef.mode === "artist" && selectedRef.path === img.storage_path
                        ? "border-ochre"
                        : "border-transparent hover:border-bone/30"
                    }`}
                    title={img.title}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.signed_url} alt={img.title} className="w-full h-full object-cover" />
                    {selectedRef.mode === "artist" && selectedRef.path === img.storage_path && (
                      <div className="absolute inset-0 bg-ochre/20 flex items-center justify-center">
                        <span className="text-ochre text-lg">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload */}
        {refMode === "upload" && (
          <div className="space-y-3 pl-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleRefUpload}
              className="text-sm text-bone/50 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-bone/10 file:text-bone/70 file:text-xs hover:file:bg-bone/15 cursor-pointer"
            />
            {selectedRef.mode === "upload" && (
              <div className="relative w-32 h-32 rounded overflow-hidden border border-bone/15">
                <Image src={selectedRef.previewUrl} alt="Reference preview" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setSelectedRef({ mode: "none" })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-ink/70 text-bone/70 text-xs hover:bg-oxblood/80 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active reference summary */}
        {activeRefPreview && (
          <div className="flex items-center gap-2 text-xs text-bone/40">
            <div className="relative w-8 h-8 rounded overflow-hidden shrink-0 border border-ochre/40">
              <Image src={activeRefPreview} alt="" fill className="object-cover" unoptimized />
            </div>
            <span>
              Reference selected —{" "}
              {selectedRef.mode === "artist" ? selectedRef.title : "uploaded image"}
            </span>
            <button type="button" onClick={() => setSelectedRef({ mode: "none" })} className="text-bone/30 hover:text-ochre ml-1">
              remove
            </button>
          </div>
        )}
      </div>
      {/* ── End Reference Image ──────────────────────────────────────────────── */}

      {/* Additional notes */}
      <div>
        <label className={LABEL}>Additional notes (optional)</label>
        <textarea
          className={INPUT}
          rows={2}
          value={notes}
          onChange={e => { setNotes(e.target.value); refreshPrompt(purpose, style, name, e.target.value); }}
          placeholder="Any extra context — mood, colour palette, references…"
        />
      </div>

      {/* Prompt preview */}
      <div>
        <label className={LABEL}>Prompt (editable)</label>
        <textarea
          className={`${INPUT} font-mono text-xs leading-relaxed`}
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        <p className="mt-1 text-[11px] text-bone/30">Edit freely — sent directly to gpt-image-1.</p>
      </div>

      {/* Generate */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="rounded bg-oxblood px-6 py-2.5 text-sm font-medium text-bone hover:bg-oxblood/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {generating
          ? "Generating… (up to 60s)"
          : selectedRef.mode !== "none"
            ? "Generate with Reference"
            : "Generate Image"}
      </button>

      {genError && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-2 text-sm text-oxblood">{genError}</p>
      )}

      {/* Result */}
      {generatedUrl && (
        <div className="space-y-4 pt-2 border-t border-bone/10">
          <p className="text-xs text-bone/40 uppercase tracking-wider">Result</p>

          <div className="rounded overflow-hidden border border-bone/10 bg-bone/5">
            <Image src={generatedUrl} alt="Generated image" width={1024} height={1024} className="w-full h-auto" unoptimized />
          </div>

          <div className="flex flex-wrap gap-3 items-start">
            <a
              href={generatedUrl}
              download="one-flame-ai-image.png"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-bone/20 px-4 py-2 text-sm text-bone/70 hover:border-bone/40 hover:text-bone transition-colors"
            >
              Download PNG
            </a>

            {showApplyTarget && applyOptions.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <select
                  value={applyTarget}
                  onChange={e => setApplyTarget(e.target.value)}
                  className="rounded border border-bone/15 bg-ink px-3 py-2 text-sm text-bone focus:outline-none focus:border-ochre/60"
                >
                  <option value="">
                    Select {purpose === "artist_photo" ? "artist" : purpose === "release_cover" ? "release" : "post"}…
                  </option>
                  {applyOptions.map(o => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying || !applyTarget || applied}
                  className="rounded bg-forest/20 border border-forest/30 px-4 py-2 text-sm text-forest hover:bg-forest/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {applying ? "Applying…" : applied ? "✓ Applied" : "Apply →"}
                </button>
                {returnUrl && applied && <span className="text-xs text-bone/40">Redirecting…</span>}
              </div>
            )}
          </div>

          {applyError && <p className="text-xs text-oxblood">{applyError}</p>}
        </div>
      )}
    </div>
  );
}
