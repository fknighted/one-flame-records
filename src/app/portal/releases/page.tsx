import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import ReleasesManagerFilter from "@/components/ReleasesManagerFilter";
import type { Tables } from "@/types/supabase";

type ReleaseRow = Tables<"releases"> & {
  artists: { stage_name: string; slug: string } | null;
};

type SearchParams = Promise<{ type?: string; status?: string }>;

// ── Status config ───────────────────────────────────────────────────────────

const STATUS_ORDER = [
  "idea", "pre-prod", "tracking", "mixing", "mastering", "scheduled", "live",
] as const;

type StatusKey = (typeof STATUS_ORDER)[number];

const STATUS_CONFIG: Record<StatusKey, { label: string; bgVar: string; fgVar: string }> = {
  "idea":       { label: "Idea",       bgVar: "--color-status-idea-bg",      fgVar: "--color-status-idea-fg" },
  "pre-prod":   { label: "Pre-prod",   bgVar: "--color-status-preprod-bg",   fgVar: "--color-status-preprod-fg" },
  "tracking":   { label: "Tracking",   bgVar: "--color-status-tracking-bg",  fgVar: "--color-status-tracking-fg" },
  "mixing":     { label: "Mixing",     bgVar: "--color-status-mixing-bg",    fgVar: "--color-status-mixing-fg" },
  "mastering":  { label: "Mastering",  bgVar: "--color-status-mastering-bg", fgVar: "--color-status-mastering-fg" },
  "scheduled":  { label: "Scheduled",  bgVar: "--color-status-scheduled-bg", fgVar: "--color-status-scheduled-fg" },
  "live":       { label: "Live",       bgVar: "--color-status-live-bg",      fgVar: "--color-status-live-fg" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG["live"];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-[10px] py-1 rounded-sm text-[10px] font-bold uppercase tracking-[0.12em] whitespace-nowrap shrink-0"
      style={{ backgroundColor: `var(${cfg.bgVar})`, color: `var(${cfg.fgVar})` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: `var(${cfg.fgVar})` }}
      />
      {cfg.label}
    </span>
  );
}

// ── Type pill ────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  single:  "bg-ochre text-ink",
  ep:      "bg-forest text-bone",
  album:   "bg-oxblood text-bone",
  mixtape: "bg-ink text-bone border border-bone/30",
};

function TypePill({ type }: { type: string }) {
  return (
    <span
      className={`inline-block px-[7px] py-[3px] rounded-sm text-[10px] font-bold uppercase tracking-[0.08em] ${
        TYPE_STYLES[type] ?? "bg-bone/10 text-bone"
      }`}
    >
      {type}
    </span>
  );
}

// ── Streaming icons ──────────────────────────────────────────────────────────

type StreamingLinks = {
  spotify?: string;
  apple_music?: string;
  tidal?: string;
  youtube_music?: string;
};

const STREAMING: {
  key: keyof StreamingLinks;
  label: string;
  buildUrl: (v: string) => string;
  path: string;
}[] = [
  {
    key: "spotify",
    label: "Spotify",
    buildUrl: (v) => v.startsWith("http") ? v : `https://open.spotify.com/album/${v}`,
    path: "M6.5 1a5.5 5.5 0 100 11A5.5 5.5 0 006.5 1zm2.5 7.93c-.1.16-.3.2-.46.1-1.27-.78-2.87-.95-4.75-.52-.18.04-.36-.07-.4-.25a.333.333 0 01.25-.4c2.06-.47 3.83-.27 5.26.6.16.1.21.3.1.47zm.67-1.49c-.13.2-.4.26-.6.13-1.45-.89-3.67-1.15-5.38-.63-.22.07-.45-.06-.52-.28s.06-.45.28-.52c1.96-.6 4.4-.3 6.08.72.2.13.26.4.14.58zm.06-1.55C8.06 5.03 5.26 4.93 3.6 5.44a.42.42 0 01-.52-.28.42.42 0 01.27-.53c1.9-.58 5.06-.47 7.06.82.24.15.31.46.16.7-.15.23-.46.31-.7.16z",
  },
  {
    key: "apple_music",
    label: "Apple Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.apple.com/album/${v}`,
    path: "M4 9.5V3.5l6-1v6M4 9.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  },
  {
    key: "youtube_music",
    label: "YouTube Music",
    buildUrl: (v) => v.startsWith("http") ? v : `https://music.youtube.com/browse/${v}`,
    path: "M6.5 1a5.5 5.5 0 100 11A5.5 5.5 0 006.5 1zm-1 7.6V4.4l4 2.1-4 2.1z",
  },
  {
    key: "tidal",
    label: "Tidal",
    buildUrl: (v) => v.startsWith("http") ? v : `https://tidal.com/browse/album/${v}`,
    path: "M4.5 2.5L6.5 4.5 4.5 6.5 2.5 4.5zM8.5 2.5L10.5 4.5 8.5 6.5 6.5 4.5zM4.5 6.5L6.5 8.5 4.5 10.5 2.5 8.5z",
  },
];

function StreamingIcons({ links }: { links: StreamingLinks }) {
  const active = STREAMING.filter(({ key }) => links[key]);
  if (!active.length) return <span className="text-bone/52 text-xs">—</span>;
  return (
    <div className="flex items-center gap-2">
      {active.map(({ key, label, buildUrl, path }) => (
        <a
          key={key}
          href={buildUrl(links[key]!)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="text-bone/60 hover:text-ochre transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
            <path d={path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

// ── Date helpers ─────────────────────────────────────────────────────────────

function shortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export const metadata = { title: "Releases" };

export default async function PortalReleasesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { type, status } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/portal/releases");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, artist_id")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const client = isAdmin ? createServiceClient() : supabase;

  const { data: allReleases } = await client
    .from("releases")
    .select("id, slug, title, type, cover_url, release_date, catalog_no, production_status, streaming_links, artist_id, artists(stage_name, slug)")
    .order("release_date", { ascending: false })
    .returns<ReleaseRow[]>();

  const releases = allReleases ?? [];

  const tileCounts = STATUS_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = releases.filter((r) => r.production_status === s).length;
    return acc;
  }, {});

  const filtered = releases.filter((r) => {
    if (type && r.type !== type) return false;
    if (status && r.production_status !== status) return false;
    return true;
  });

  return (
    <div className="px-4 py-4 sm:px-8 sm:py-8">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6 pb-5 border-b border-bone/10">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-1">
            {isAdmin ? "Label catalog" : "Your releases"}
          </p>
          <h1 className="font-display font-bold text-bone text-[2rem] sm:text-[2.5rem] leading-none tracking-[-0.018em]">
            Releases.
          </h1>
          <div className="mt-3 h-px w-16 bg-bone/30" />
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/releases/new"
              className="rounded px-3 py-1.5 sm:px-4 sm:py-2 bg-ochre text-ink text-xs sm:text-sm font-semibold hover:bg-bone transition-colors"
            >
              + New
            </Link>
          )}
        </div>
      </div>

      {/* ── Status tile strip — scrolls on mobile ── */}
      <div className="overflow-x-auto mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex border border-bone/10 rounded-sm overflow-hidden min-w-[480px] sm:min-w-0">
          {STATUS_ORDER.map((s, i) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = status === s;
            const href = isActive
              ? `/portal/releases${type ? `?type=${type}` : ""}`
              : `/portal/releases?status=${s}${type ? `&type=${type}` : ""}`;
            return (
              <Link
                key={s}
                href={href}
                className={`flex-1 px-3 sm:px-4 py-3 text-center transition-colors ${
                  i > 0 ? "border-l border-bone/10" : ""
                } ${isActive ? "bg-bone/10" : "hover:bg-bone/5"}`}
              >
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1">
                  <span
                    className="w-[6px] sm:w-[7px] h-[6px] sm:h-[7px] rounded-full shrink-0"
                    style={{ backgroundColor: `var(${cfg.fgVar})` }}
                  />
                  <span
                    className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: `var(${cfg.fgVar})` }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="font-display font-bold text-bone text-lg sm:text-2xl leading-none tracking-[-0.01em]">
                  {tileCounts[s] ?? 0}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Filter row ── */}
      <div className="flex items-center justify-between py-3 border-t border-b border-bone/10 mb-0">
        <Suspense fallback={null}>
          <ReleasesManagerFilter basePath="/portal/releases" />
        </Suspense>
        <span className="font-mono text-[11px] text-bone/60 tracking-[0.04em] shrink-0 ml-3">
          {filtered.length} of {releases.length}
        </span>
      </div>

      {/* ── Column headers — desktop only ── */}
      <div
        className={`hidden sm:grid gap-4 px-0 py-3 border-b border-bone/10 ${
          isAdmin
            ? "grid-cols-[80px_44px_1fr_160px_100px_130px_110px_110px]"
            : "grid-cols-[80px_44px_1fr_100px_130px_110px_110px]"
        }`}
      >
        {["Cat #", "", "Title", ...(isAdmin ? ["Artist"] : []), "Format", "Status", "Released", "Listen"].map(
          (col) => (
            <span
              key={col}
              className="font-mono text-[10px] text-bone/50 uppercase tracking-[0.16em]"
            >
              {col}
            </span>
          )
        )}
      </div>

      {/* ── Release rows ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          {releases.length === 0 ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/50 mb-2">
                Empty roster
              </p>
              <p className="font-display font-bold text-bone text-2xl">
                No records here yet.
              </p>
            </>
          ) : (
            <p className="text-bone/50 text-sm">
              No releases match this filter.{" "}
              <Link href="/portal/releases" className="text-ochre hover:text-ochre/80 transition-colors">
                Reset
              </Link>
            </p>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((release) => {
            const artist = release.artists as { stage_name: string; slug: string } | null;
            const streaming = (release.streaming_links as StreamingLinks) ?? {};

            return (
              <Link
                key={release.id}
                href={`/releases/${release.slug}`}
                className="block group border-b border-bone/10 hover:bg-bone/5 transition-colors"
              >
                {/* ── Mobile card ── */}
                <div className="sm:hidden flex items-start gap-3 py-3">
                  <div className="relative w-10 h-10 shrink-0 bg-oxblood/10 border border-white/5">
                    {release.cover_url && (
                      <Image
                        src={release.cover_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-display font-bold text-bone text-sm leading-snug tracking-[-0.005em] group-hover:text-ochre transition-colors truncate">
                        {release.title}
                      </p>
                      <StatusPill status={release.production_status} />
                    </div>
                    <p className="text-[11px] text-bone/60 mb-1.5">
                      {release.catalog_no && (
                        <span className="font-mono">{release.catalog_no} · </span>
                      )}
                      <span className="uppercase">{release.type}</span>
                      {" · "}{shortDate(release.release_date)}
                      {isAdmin && artist && (
                        <span className="text-bone/50"> · {artist.stage_name}</span>
                      )}
                    </p>
                    <StreamingIcons links={streaming} />
                  </div>
                </div>

                {/* ── Desktop grid row ── */}
                <div
                  className={`hidden sm:grid gap-4 py-3 items-center ${
                    isAdmin
                      ? "grid-cols-[80px_44px_1fr_160px_100px_130px_110px_110px]"
                      : "grid-cols-[80px_44px_1fr_100px_130px_110px_110px]"
                  }`}
                >
                  <span className="font-mono text-xs text-sage tracking-[0.06em] font-medium">
                    {release.catalog_no ?? "—"}
                  </span>

                  <div className="relative w-[40px] h-[40px] shrink-0 bg-oxblood/10 border border-white/5">
                    {release.cover_url && (
                      <Image
                        src={release.cover_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-display font-bold text-bone text-base leading-snug tracking-[-0.005em] group-hover:text-ochre transition-colors truncate">
                      {release.title}
                    </p>
                    <p className="text-[11px] text-bone/50 mt-0.5">—</p>
                  </div>

                  {isAdmin && (
                    <span
                      className="text-[13px] text-bone/70 hover:text-ochre transition-colors truncate"
                      onClick={(e) => {
                        e.preventDefault();
                        if (artist) window.location.href = `/artists/${artist.slug}`;
                      }}
                    >
                      {artist?.stage_name ?? "—"}
                    </span>
                  )}

                  <div>
                    <TypePill type={release.type} />
                  </div>

                  <div>
                    <StatusPill status={release.production_status} />
                  </div>

                  <span className="font-mono text-xs text-bone/70">
                    {shortDate(release.release_date)}
                  </span>

                  <div>
                    <StreamingIcons links={streaming} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <p className="pt-5 text-[12px] text-bone/50">
        Showing {filtered.length} of {releases.length} releases
      </p>
    </div>
  );
}
