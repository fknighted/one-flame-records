import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import ReleasesManagerFilter from "@/components/ReleasesManagerFilter";
import StreamingIcons, { type StreamingLinks } from "./StreamingIcons";
import ArtistLink from "./ArtistLink";
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
                    <ArtistLink stageName={artist?.stage_name ?? null} slug={artist?.slug ?? null} />
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
