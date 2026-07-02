"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateIdeas, dismissIdea, markExpanded, createNewsFromIdea } from "./actions";
import { PILLARS, type Idea } from "./constants";

const PILLAR_COLORS: Record<string, string> = {
  artist_spotlight:  "bg-oxblood/15 text-rose border border-oxblood/20",
  release_promotion: "bg-forest/15 text-sage border border-forest/20",
  behind_the_music:  "bg-ochre/15 text-ochre border border-ochre/20",
  culture_roots:     "bg-[#3F5A3A]/20 text-[#7FAD78] border border-[#3F5A3A]/30",
  fan_engagement:    "bg-bone/10 text-bone/60 border border-bone/15",
  label_news:        "bg-bone/5 text-bone/60 border border-bone/10",
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "IG",
  tiktok:    "TT",
  facebook:  "FB",
};

function pillarLabel(value: string): string {
  return PILLARS.find(p => p.value === value)?.label ?? value;
}

function IdeaCard({ idea, onDismiss }: { idea: Idea; onDismiss: (id: string) => void }) {
  const [dismissing, startDismiss]   = useTransition();
  const [expanding, startExpand]     = useTransition();
  const [toNews, startToNews]        = useTransition();

  const campaignUrl = `/admin/campaigns/new?title=${encodeURIComponent(idea.title)}&angle=${encodeURIComponent(idea.angle ?? "")}&source_type=${idea.source_type}&platforms=instagram,tiktok,facebook`;

  return (
    <div className={`rounded-lg border overflow-hidden transition-opacity ${idea.status === "expanded" ? "opacity-50" : "hover:border-bone/20"} border-bone/10`}>
      <div className="p-4 space-y-2.5">
        {/* Pillar + platforms */}
        <div className="flex items-center gap-2 flex-wrap">
          {idea.pillar && (
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${PILLAR_COLORS[idea.pillar] ?? "bg-bone/10 text-bone/60"}`}>
              {pillarLabel(idea.pillar)}
            </span>
          )}
          <div className="flex gap-1 ml-auto">
            {(idea.suggested_platforms ?? []).map(p => (
              <span key={p} className="text-[10px] text-bone/50 font-mono">{PLATFORM_LABELS[p] ?? p}</span>
            ))}
          </div>
        </div>

        {/* Title */}
        <p className="font-display font-bold text-bone text-base leading-snug">{idea.title}</p>

        {/* Angle */}
        {idea.angle && (
          <p className="text-sm text-bone/50 leading-relaxed">{idea.angle}</p>
        )}

        {/* Source type */}
        <p className="text-[11px] text-bone/60 uppercase tracking-wider">Source: {idea.source_type}</p>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-bone/8 flex-wrap">
          {idea.status !== "expanded" && (
            <Link
              href={campaignUrl}
              onClick={() => { startExpand(() => markExpanded(idea.id)); }}
              className="text-xs font-medium text-ochre hover:text-ochre/80 transition-colors"
            >
              {expanding ? "Opening…" : "Start Campaign →"}
            </Link>
          )}
          {idea.status !== "expanded" && (
            <button
              type="button"
              disabled={toNews}
              onClick={() => { startToNews(() => createNewsFromIdea(idea.id)); }}
              className="text-xs text-bone/60 hover:text-bone/70 disabled:opacity-40 transition-colors"
            >
              {toNews ? "Creating…" : "→ News post"}
            </button>
          )}
          {idea.status === "expanded" && (
            <span className="text-xs text-bone/50">✓ Expanded</span>
          )}
          <form action={() => { startDismiss(() => dismissIdea(idea.id)); }} className="ml-auto">
            <button
              type="submit"
              disabled={dismissing}
              className="text-xs text-bone/52 hover:text-rose/60 transition-colors disabled:opacity-40"
            >
              Dismiss
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function IdeasClient({ initialIdeas }: { initialIdeas: Idea[] }) {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [generating, startGenerating] = useTransition();
  const [genError, setGenError] = useState<string | null>(null);

  function handleDismiss(id: string) {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: "dismissed" } : i));
  }

  function handleGenerate() {
    setGenError(null);
    startGenerating(async () => {
      const result = await generateIdeas();
      if (result.error) { setGenError(result.error); return; }
      router.refresh();
    });
  }

  const activeFilter: ("draft" | "expanded" | "dismissed")[] = ["draft", "expanded"];
  const visible = ideas.filter(i => activeFilter.includes(i.status as "draft" | "expanded" | "dismissed"));

  // Group by pillar
  const grouped: Record<string, Idea[]> = {};
  for (const idea of visible) {
    const key = idea.pillar ?? "uncategorized";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(idea);
  }

  const draftCount = ideas.filter(i => i.status === "draft").length;

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded bg-ochre px-5 py-2.5 text-sm font-medium text-ink hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? "Generating ideas…" : "✦ Generate ideas"}
        </button>
        {draftCount > 0 && (
          <p className="text-xs text-bone/60">{draftCount} draft idea{draftCount !== 1 ? "s" : ""} ready to expand</p>
        )}
      </div>

      {genError && (
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-2 text-sm text-rose">{genError}</p>
      )}

      {visible.length === 0 ? (
        <div className="border border-bone/10 rounded-lg p-12 text-center text-bone/50 text-sm">
          No ideas yet — click &quot;Generate ideas&quot; to get started.
        </div>
      ) : (
        <div className="space-y-10">
          {PILLARS.map(pillar => {
            const pillarIdeas = grouped[pillar.value] ?? [];
            if (!pillarIdeas.length) return null;
            return (
              <div key={pillar.value}>
                <div className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/52">{pillar.label}</p>
                  <p className="text-[11px] text-bone/52 mt-0.5">{pillar.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pillarIdeas.map(idea => (
                    <IdeaCard key={idea.id} idea={idea} onDismiss={handleDismiss} />
                  ))}
                </div>
              </div>
            );
          })}
          {/* Uncategorized */}
          {(grouped["uncategorized"] ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60 mb-3">Other</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped["uncategorized"].map(idea => (
                  <IdeaCard key={idea.id} idea={idea} onDismiss={handleDismiss} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
