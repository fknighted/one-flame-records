"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { AdminVideoRequestState } from "@/app/admin/artists/[id]/videos/new/actions";

const SECONDS_PER_CLIP = 10;
const MIN_CLIPS = 4;
const MAX_CLIPS = 20;
const COST_PER_CLIP_USD = 0.25; // 10s × $0.025/s, kie.ai Kling 2.1 Standard

function estimateCost(durationSeconds: number | null): { clips: number; cost: string } | null {
  if (!durationSeconds) return null;
  const clips = Math.min(MAX_CLIPS, Math.max(MIN_CLIPS, Math.round(durationSeconds / SECONDS_PER_CLIP)));
  const cost = (clips * COST_PER_CLIP_USD).toFixed(2);
  return { clips, cost };
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const STYLE_PRESETS = [
  "Vintage roots reggae performance",
  "Modern dancehall energy",
  "Acoustic roots session",
  "Cinematic Jamaican landscape",
  "Studio session documentary",
  "Lovers rock romance",
  "Spiritual roots mystic",
  "Kingston street life",
  "Bashment party / club",
  "Black and white timeless",
  "VHS nostalgia",
  "Tropical beach escape",
  "Fashion editorial",
  "Lyric video",
  "Abstract visualizer",
  "Festival / carnival",
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 — Landscape (YouTube)" },
  { value: "9:16", label: "9:16 — Vertical (Reels / TikTok)" },
  { value: "1:1",  label: "1:1 — Square (Instagram)" },
];

type ScenePreview = { start: number; end: number; prompt: string; aspectRatio: string; referenceImageId?: string };

interface AssetOption {
  id: string;
  title: string;
  duration_seconds: number | null;
  notes: string | null;
}

interface ReferenceImage {
  id: string;
  title: string;
  thumbUrl: string | null;
}

interface ReferenceVideo {
  id: string;
  title: string;
  notes: string | null;
}

interface Props {
  assets: AssetOption[];
  defaultAssetId?: string;
  referenceImages: ReferenceImage[];
  referenceVideos: ReferenceVideo[];
  artistGenres: string[];
  action: (prev: AdminVideoRequestState, formData: FormData) => Promise<AdminVideoRequestState>;
  onTranscribe: (assetId: string) => Promise<{ transcript: string } | { error: string }>;
  onGenerateScript: (
    assetId: string,
    params: {
      stylePreset: string;
      aspectRatio: "16:9" | "9:16" | "1:1";
      lyrics?: string;
      creativeBrief?: string;
      referenceVideoIds?: string[];
      artistGenres?: string[];
    }
  ) => Promise<{ scenes: ScenePreview[] } | { error: string }>;
}

export function AdminVideoRequestForm({ assets, defaultAssetId, referenceImages, referenceVideos, artistGenres, action, onTranscribe, onGenerateScript }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const [selectedAssetId, setSelectedAssetId] = useState(defaultAssetId ?? "");
  const [selectedStylePreset, setSelectedStylePreset] = useState(STYLE_PRESETS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [lyrics, setLyrics] = useState("");
  const [creativeBrief, setCreativeBrief] = useState("");
  const [selectedRefVideoIds, setSelectedRefVideoIds] = useState<string[]>([]);

  const [transcribing, setTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const [scripting, setScripting] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [editableScenes, setEditableScenes] = useState<ScenePreview[] | null>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const estimate = estimateCost(selectedAsset?.duration_seconds ?? null);

  async function handleTranscribe() {
    if (!selectedAssetId) return;
    setTranscribing(true);
    setTranscribeError(null);
    const result = await onTranscribe(selectedAssetId);
    if ("error" in result) {
      setTranscribeError(result.error);
    } else {
      setLyrics(result.transcript);
    }
    setTranscribing(false);
  }

  async function handleGenerateScript() {
    if (!selectedAssetId) return;
    setScripting(true);
    setScriptError(null);
    setEditableScenes(null);
    const result = await onGenerateScript(selectedAssetId, {
      stylePreset: selectedStylePreset,
      aspectRatio: selectedAspectRatio,
      lyrics: lyrics.trim() || undefined,
      creativeBrief: creativeBrief.trim() || undefined,
      referenceVideoIds: selectedRefVideoIds.length ? selectedRefVideoIds : undefined,
      artistGenres: artistGenres.length ? artistGenres : undefined,
    });
    if ("error" in result) {
      setScriptError(result.error);
    } else {
      setEditableScenes(result.scenes);
    }
    setScripting(false);
  }

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {state?.error && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-3 text-sm text-bone">
          {state.error}
        </p>
      )}

      {/* Asset selector */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Source audio
        </label>
        <select
          name="asset_id"
          required
          defaultValue={defaultAssetId ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedAssetId(id);
            setEditableScenes(null);
            // Auto-fill Director's notes from the asset's notes field if brief is empty
            const asset = assets.find((a) => a.id === id);
            if (asset?.notes && !creativeBrief.trim()) {
              setCreativeBrief(asset.notes);
            }
          }}
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre"
        >
          <option value="">Select an asset…</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
              {a.duration_seconds
                ? ` (${Math.floor(a.duration_seconds / 60)}:${String(a.duration_seconds % 60).padStart(2, "0")})`
                : ""}
            </option>
          ))}
        </select>
        {estimate && (
          <p className="mt-2 text-xs text-bone/40">
            ~{estimate.clips} clips · estimated cost <span className="text-bone/60">${estimate.cost}</span>
          </p>
        )}
      </div>

      {/* Style preset */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Visual style
        </label>
        <select
          name="style_preset"
          defaultValue={STYLE_PRESETS[0]}
          onChange={(e) => { setSelectedStylePreset(e.target.value); setEditableScenes(null); }}
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm focus:outline-none focus:border-ochre"
        >
          {STYLE_PRESETS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Aspect ratio */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Format
        </label>
        <div className="flex flex-col gap-2">
          {ASPECT_RATIOS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="aspect_ratio"
                value={value}
                defaultChecked={value === "16:9"}
                onChange={() => { setSelectedAspectRatio(value as "16:9" | "9:16" | "1:1"); setEditableScenes(null); }}
                className="accent-ochre"
              />
              <span className="text-sm text-bone">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reference images */}
      {referenceImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-bone/70 mb-2">
            Reference images
            <span className="ml-2 text-bone/40 font-normal text-xs">optional — anchors visual style</span>
          </label>
          <div className="flex flex-col gap-2">
            {referenceImages.map((img) => (
              <label key={img.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="reference_image_ids"
                  value={img.id}
                  className="accent-ochre flex-shrink-0"
                />
                {img.thumbUrl ? (
                  <img
                    src={img.thumbUrl}
                    alt={img.title}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-bone/10 flex-shrink-0" />
                )}
                <span className="text-sm text-bone group-hover:text-ochre transition-colors truncate">
                  {img.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Reference videos */}
      {referenceVideos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-bone/70 mb-2">
            Reference videos
            <span className="ml-2 text-bone/40 font-normal text-xs">optional — title &amp; notes guide the script</span>
          </label>
          <div className="flex flex-col gap-2">
            {referenceVideos.map((vid) => (
              <label key={vid.id} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="reference_video_ids"
                  value={vid.id}
                  checked={selectedRefVideoIds.includes(vid.id)}
                  onChange={(e) => {
                    setSelectedRefVideoIds((prev) =>
                      e.target.checked ? [...prev, vid.id] : prev.filter((x) => x !== vid.id)
                    );
                    setEditableScenes(null);
                  }}
                  className="accent-ochre flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <span className="text-sm text-bone group-hover:text-ochre transition-colors truncate block">
                    {vid.title}
                  </span>
                  {vid.notes && (
                    <span className="text-xs text-bone/35 leading-relaxed line-clamp-2">{vid.notes}</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Creative brief */}
      <div>
        <label className="block text-sm font-medium text-bone/70 mb-2">
          Director&apos;s notes
          <span className="ml-2 text-bone/40 font-normal text-xs">optional</span>
        </label>
        <textarea
          name="creative_brief"
          rows={4}
          value={creativeBrief}
          onChange={(e) => { setCreativeBrief(e.target.value); setEditableScenes(null); }}
          placeholder="Mood, story arc, locations, visual references, anything you want Claude to factor in…"
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm placeholder:text-bone/25 focus:outline-none focus:border-ochre resize-y"
        />
      </div>

      {/* Lyrics */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-bone/70">
            Lyrics
            <span className="ml-2 text-bone/40 font-normal text-xs">auto-transcribed — paste here to override</span>
          </label>
          <button
            type="button"
            onClick={handleTranscribe}
            disabled={!selectedAssetId || transcribing}
            className="text-xs px-3 py-1 rounded border border-bone/20 text-bone/60 hover:text-ochre hover:border-ochre transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {transcribing ? "Transcribing…" : "Transcribe audio"}
          </button>
        </div>
        {transcribeError && (
          <p className="mb-2 text-xs text-oxblood">{transcribeError}</p>
        )}
        <textarea
          name="lyrics"
          rows={6}
          value={lyrics}
          onChange={(e) => { setLyrics(e.target.value); setEditableScenes(null); }}
          placeholder="Leave blank to auto-transcribe from the audio…"
          className="w-full rounded border border-bone/20 bg-bone/5 px-3 py-2 text-bone text-sm placeholder:text-bone/25 focus:outline-none focus:border-ochre resize-y font-mono"
        />
      </div>

      {/* Scene plan preview */}
      <div className="rounded border border-bone/10 bg-bone/3 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-bone/70">Scene plan preview</p>
            <p className="text-xs text-bone/30 mt-0.5">Run Claude before submitting to review the video script</p>
          </div>
          <button
            type="button"
            onClick={handleGenerateScript}
            disabled={!selectedAssetId || scripting}
            className="text-xs px-3 py-1.5 rounded border border-ochre/40 text-ochre hover:bg-ochre/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {scripting ? "Generating…" : editableScenes ? "Regenerate" : "Generate preview"}
          </button>
        </div>

        {scriptError && (
          <p className="text-xs text-oxblood">{scriptError}</p>
        )}

        {scripting && (
          <p className="text-xs text-bone/30 animate-pulse">Analyzing audio and writing scene prompts…</p>
        )}

        {editableScenes && !scripting && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            <p className="text-xs text-bone/30 pb-1">Edit any scene below before submitting.</p>
            {editableScenes.map((scene, i) => (
              <div key={i} className="rounded border border-bone/10 bg-bone/5 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-bone/30">
                    {formatTime(scene.start)} – {formatTime(scene.end)}
                  </span>
                  <span className="text-xs text-bone/60">Scene {i + 1}</span>
                </div>
                <textarea
                  rows={3}
                  value={scene.prompt}
                  onChange={(e) => {
                    const updated = editableScenes.map((s, j) =>
                      j === i ? { ...s, prompt: e.target.value } : s
                    );
                    setEditableScenes(updated);
                  }}
                  className="w-full text-xs text-bone/80 leading-relaxed bg-transparent border border-bone/15 rounded px-2 py-1.5 focus:outline-none focus:border-ochre resize-y"
                />
                {referenceImages.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-bone/30 mb-1.5">Starting frame <span className="text-bone/20">(optional)</span></p>
                    <div className="flex flex-wrap gap-1.5">
                      {referenceImages.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          title={img.title}
                          onClick={() =>
                            setEditableScenes((prev) =>
                              prev!.map((s, j) =>
                                j === i
                                  ? { ...s, referenceImageId: s.referenceImageId === img.id ? undefined : img.id }
                                  : s
                              )
                            )
                          }
                          className={`w-10 h-10 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${
                            scene.referenceImageId === img.id
                              ? "border-ochre ring-1 ring-ochre/40"
                              : "border-transparent opacity-50 hover:opacity-80"
                          }`}
                        >
                          {img.thumbUrl ? (
                            <img src={img.thumbUrl} alt={img.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-bone/10" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!editableScenes && !scripting && !scriptError && (
          <p className="text-xs text-bone/20">No preview yet — select an asset and click Generate preview.</p>
        )}
      </div>

      <input type="hidden" name="model" value="" />
      {editableScenes && (
        <input type="hidden" name="scenes" value={JSON.stringify(editableScenes)} />
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-ochre px-6 py-2.5 text-sm font-semibold text-ink hover:bg-ochre/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting…" : "Generate video"}
      </button>
    </form>
  );
}
