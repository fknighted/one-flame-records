"use client";

import { useState, useTransition, useRef } from "react";
import { generateCopy } from "./actions";

type Artist = { id: string; stage_name: string };

const PURPOSES = [
  { value: "artist_bio",           label: "Artist Bio" },
  { value: "release_description",  label: "Release Description" },
  { value: "news_post",            label: "News Post" },
  { value: "social_caption",       label: "Social Caption" },
] as const;
type Purpose = typeof PURPOSES[number]["value"];

const INPUT  = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL  = "block text-xs text-bone/50 mb-1.5";

export default function CopyGeneratorForm({ artists }: { artists: Artist[] }) {
  const [purpose,  setPurpose]  = useState<Purpose>("artist_bio");
  const [artistId, setArtistId] = useState("");
  const [notes,    setNotes]    = useState("");
  const [output,   setOutput]   = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [copied,   setCopied]   = useState(false);

  const [generating, startGenerating] = useTransition();
  const outputRef = useRef<HTMLTextAreaElement>(null);

  function handlePurpose(p: Purpose) {
    setPurpose(p);
    setOutput("");
    setError(null);
  }

  function handleGenerate() {
    setError(null);
    setOutput("");
    setCopied(false);
    const fd = new FormData();
    fd.set("purpose",   purpose);
    fd.set("artist_id", artistId);
    fd.set("notes",     notes);
    startGenerating(async () => {
      const result = await generateCopy(fd);
      if (result.error) setError(result.error);
      else setOutput(result.text ?? "");
    });
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const showArtist = purpose === "artist_bio" || purpose === "social_caption";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Purpose */}
      <div>
        <label className={LABEL}>Purpose</label>
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePurpose(value)}
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

      {/* Artist selector */}
      {showArtist && artists.length > 0 && (
        <div>
          <label className={LABEL}>Artist (provides context)</label>
          <select
            value={artistId}
            onChange={e => setArtistId(e.target.value)}
            className={INPUT + " bg-ink"}
          >
            <option value="">Select artist…</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>{a.stage_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Extra notes */}
      <div>
        <label className={LABEL}>
          {purpose === "artist_bio" ? "Key points to highlight (optional)" :
           purpose === "release_description" ? "Release title + key details" :
           purpose === "news_post" ? "What's the news about?" :
           "What's this caption for?"}
        </label>
        <textarea
          className={INPUT}
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={
            purpose === "artist_bio" ? "e.g. Known for conscious roots style, toured with Sizzla in 2023…" :
            purpose === "release_description" ? "e.g. 'Jungle Riddim Vol. 1' — dancehall compilation, 8 tracks, releases June 2025…" :
            purpose === "news_post" ? "e.g. We just signed artist Mystical Reasoning to the label…" :
            "e.g. New single 'Rise Up' out now on all platforms…"
          }
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className="rounded bg-oxblood px-6 py-2.5 text-sm font-medium text-bone hover:bg-oxblood/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {generating ? "Writing…" : "Generate Copy"}
      </button>

      {error && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-2 text-sm text-oxblood">{error}</p>
      )}

      {/* Output */}
      {output && (
        <div className="space-y-3 pt-4 border-t border-bone/10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-bone/40 uppercase tracking-wider">Output</p>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-ochre/70 hover:text-ochre transition-colors"
            >
              {copied ? "✓ Copied" : "Copy to clipboard"}
            </button>
          </div>
          <textarea
            ref={outputRef}
            value={output}
            onChange={e => setOutput(e.target.value)}
            rows={12}
            className={`${INPUT} font-sans leading-relaxed`}
          />
          <p className="text-[11px] text-bone/25">Output is editable — refine before using.</p>
        </div>
      )}
    </div>
  );
}
