import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import ApplicationActions from "@/components/ApplicationActions";
import ResendInviteButton from "@/components/ResendInviteButton";
import type { Tables } from "@/types/supabase";

type AppRow = Tables<"signup_applications">;

type Socials = {
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  youtube?: string | null;
};

const SOCIAL_LABELS: { key: keyof Socials; label: string; prefix: string }[] = [
  { key: "instagram", label: "Instagram", prefix: "https://instagram.com/" },
  { key: "tiktok",    label: "TikTok",    prefix: "https://tiktok.com/@" },
  { key: "youtube",   label: "YouTube",   prefix: "https://youtube.com/" },
  { key: "twitter",   label: "Twitter/X", prefix: "https://x.com/" },
];

const STATUS_BADGE: Record<string, string> = {
  pending:  "studio-chip-neutral",
  approved: "studio-chip-ok",
  rejected: "studio-chip-bad",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: app, error } = await supabase
    .from("signup_applications")
    .select("*")
    .eq("id", id)
    .single<AppRow>();

  if (error || !app) notFound();

  const socials = (app.socials ?? {}) as Socials;

  return (
    <div className="max-w-2xl">
      {/* Back link + header */}
      <div className="mb-8">
        <Link
          href="/admin/applications"
          className="studio-btn studio-btn-quiet studio-btn-sm mb-4 -ml-3.5"
        >
          Applications
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="studio-label mb-2">Application</p>
            <h1 className="studio-page-title">{app.stage_name}</h1>
          </div>
          <span
            className={`studio-chip mt-1 capitalize ${STATUS_BADGE[app.status] ?? "studio-chip-neutral"}`}
          >
            {app.status}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="studio-card p-0 divide-y divide-line">
        <Field label="Stage name"   value={app.stage_name} />
        <Field label="Legal name"   value={app.legal_name} />
        <Field label="Email"        value={app.email} />
        <Field label="Phone"        value={app.phone ?? "—"} />
        <Field
          label="Genres"
          value={
            app.genres.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {app.genres.map((g) => (
                  <span
                    key={g}
                    className="studio-chip studio-chip-neutral"
                  >
                    {g}
                  </span>
                ))}
              </div>
            ) : (
              "—"
            )
          }
        />

        {/* Socials */}
        <div className="px-5 py-4">
          <p className="studio-label mb-2">
            Socials
          </p>
          <div className="space-y-1.5">
            {SOCIAL_LABELS.map(({ key, label, prefix }) => {
              const handle = socials[key];
              if (!handle) {
                return (
                  <p key={key} className="text-muted">
                    {label}: —
                  </p>
                );
              }
              const url = handle.startsWith("http") ? handle : `${prefix}${handle}`;
              return (
                <p key={key}>
                  <span className="text-muted">{label}: </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="studio-link [overflow-wrap:anywhere]"
                  >
                    {handle}
                  </a>
                </p>
              );
            })}
          </div>
        </div>

        {app.message && (
          <div className="px-5 py-4">
            <p className="studio-label mb-2">
              Message
            </p>
            <p className="text-paper whitespace-pre-wrap">
              {app.message}
            </p>
          </div>
        )}

        <Field label="Submitted"  value={formatDate(app.created_at)} />
        {app.reviewed_at && (
          <Field label="Reviewed" value={formatDate(app.reviewed_at)} />
        )}
      </div>

      {/* Actions — only shown while pending */}
      {app.status === "pending" && (
        <div className="mt-8">
          <p className="studio-label mb-4">
            Decision
          </p>
          <ApplicationActions id={app.id} />
        </div>
      )}

      {app.status !== "pending" && (
        <div className="mt-6">
          <p className="text-muted">
            This application has been{" "}
            <span className="capitalize">{app.status}</span>.
          </p>
          {app.status === "approved" && (
            <ResendInviteButton id={app.id} email={app.email} />
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <p className="studio-label sm:w-28 shrink-0 pt-px">
        {label}
      </p>
      <div className="text-paper min-w-0 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}
