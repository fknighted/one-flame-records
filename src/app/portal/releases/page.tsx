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

const STATUS_CONFIG: Record<StatusKey, { label: string; chip: string }> = {
  "idea":       { label: "Idea",       chip: "studio-chip-neutral" },
  "pre-prod":   { label: "Pre-prod",   chip: "studio-chip-neutral" },
  "tracking":   { label: "Tracking",   chip: "studio-chip-neutral" },
  "mixing":     { label: "Mixing",     chip: "studio-chip-neutral" },
  "mastering":  { label: "Mastering",  chip: "studio-chip-neutral" },
  "scheduled":  { label: "Scheduled",  chip: "studio-chip-neutral" },
  "live":       { label: "Live",       chip: "studio-chip-ok" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as StatusKey] ?? STATUS_CONFIG["live"];
  return (
    <span className={`studio-chip ${cfg.chip} shrink-0`}>
      {cfg.label}
    </span>
  );
}

// ── Type pill ────────────────────────────────────────────────────────────────

function TypePill({ type }: { type: string }) {
  return (
    <span className="studio-chip studio-chip-neutral capitalize">
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
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-5 border-b border-line">
        <div className="min-w-0">
          <p className="studio-label mb-1">
            {isAdmin ? "Label catalog" : "Your releases"}
          </p>
          <h1 className="studio-page-title">
            Releases
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/releases/new"
              className="studio-btn studio-btn-primary"
            >
              New
            </Link>
          )}
        </div>
      </div>

      {/* ── Status tile strip — scrolls on mobile ── */}
      <div className="studio-table-wrap mb-6">
        <div className="flex min-w-[560px] sm:min-w-0">
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
                className={`studio-focus flex-1 px-3 sm:px-4 py-3 min-h-[44px] text-center transition-colors ${
                  i > 0 ? "border-l border-line" : ""
                } ${isActive ? "bg-raised" : "hover:bg-raised"}`}
              >
                <p className="studio-label mb-1">{cfg.label}</p>
                <p className="studio-count">
                  {tileCounts[s] ?? 0}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Filter row ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-t border-b border-line mb-0">
        <Suspense fallback={null}>
          <ReleasesManagerFilter basePath="/portal/releases" />
        </Suspense>
        <span className="studio-count shrink-0">
          {filtered.length} of {releases.length}
        </span>
      </div>

      {/* ── Column headers — desktop only ── */}
      <div
        className={`hidden sm:grid gap-4 px-0 py-3 border-b border-line ${
          isAdmin
            ? "grid-cols-[80px_44px_1fr_160px_100px_130px_110px_110px]"
            : "grid-cols-[80px_44px_1fr_100px_130px_110px_110px]"
        }`}
      >
        {["Cat #", "", "Title", ...(isAdmin ? ["Artist"] : []), "Format", "Status", "Released", "Listen"].map(
          (col, idx) => (
            <span
              key={`${col}-${idx}`}
              className="studio-label"
            >
              {col}
            </span>
          )
        )}
      </div>

      {/* ── Release rows ── */}
      {filtered.length === 0 ? (
        <div className="py-10">
          {releases.length === 0 ? (
            <div className="studio-empty">
              <p className="studio-label">Empty roster</p>
              <p className="studio-empty-title">
                No records here yet.
              </p>
            </div>
          ) : (
            <p className="text-[16px] text-muted">
              No releases match this filter.{" "}
              <Link href="/portal/releases" className="studio-link inline-flex min-h-[44px] items-center">
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
                className="studio-focus block group border-b border-line hover:bg-raised transition-colors"
              >
                {/* ── Mobile card ── */}
                <div className="sm:hidden flex items-start gap-3 py-3">
                  <div className="relative w-10 h-10 shrink-0 bg-panel border border-line">
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
                      <p className="text-paper font-bold text-[16px] leading-snug truncate">
                        {release.title}
                      </p>
                      <StatusPill status={release.production_status} />
                    </div>
                    <p className="text-[14px] text-muted mb-1.5">
                      {release.catalog_no && (
                        <span className="studio-figures">{release.catalog_no} · </span>
                      )}
                      <span className="uppercase">{release.type}</span>
                      {" · "}{shortDate(release.release_date)}
                      {isAdmin && artist && (
                        <span> · {artist.stage_name}</span>
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
                  <span className="studio-figures text-[14px] text-muted">
                    {release.catalog_no ?? "—"}
                  </span>

                  <div className="relative w-[40px] h-[40px] shrink-0 bg-panel border border-line">
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
                    <p className="text-paper font-bold text-[16px] leading-snug truncate">
                      {release.title}
                    </p>
                    <p className="text-[13px] text-muted mt-0.5">—</p>
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

                  <span className="studio-figures text-[14px] text-muted">
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
      <p className="pt-5 text-[14px] text-muted">
        Showing {filtered.length} of {releases.length} releases
      </p>
    </div>
  );
}
