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
  pending:  "bg-ochre/15 text-ochre",
  approved: "bg-forest/20 text-sage",
  rejected: "bg-oxblood/20 text-red-400",
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
          className="text-xs text-bone/60 hover:text-bone/70 transition-colors mb-4 inline-block"
        >
          ← Applications
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage mb-2">
              Application
            </p>
            <h1 className="font-display font-bold text-bone text-3xl">
              {app.stage_name}
            </h1>
          </div>
          <span
            className={`mt-1 inline-block px-3 py-1 rounded text-xs font-medium capitalize ${STATUS_BADGE[app.status] ?? "bg-bone/10 text-bone/50"}`}
          >
            {app.status}
          </span>
        </div>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Fields */}
      <div className="bg-bone/5 border border-bone/10 rounded-lg divide-y divide-bone/5">
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
                    className="px-2 py-0.5 rounded bg-bone/10 text-bone/70 text-xs"
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
          <p className="text-xs text-bone/60 uppercase tracking-widest mb-2">
            Socials
          </p>
          <div className="space-y-1.5">
            {SOCIAL_LABELS.map(({ key, label, prefix }) => {
              const handle = socials[key];
              if (!handle) {
                return (
                  <p key={key} className="text-sm text-bone/50">
                    {label}: —
                  </p>
                );
              }
              const url = handle.startsWith("http") ? handle : `${prefix}${handle}`;
              return (
                <p key={key} className="text-sm">
                  <span className="text-bone/60">{label}: </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ochre hover:text-ochre/80 transition-colors"
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
            <p className="text-xs text-bone/60 uppercase tracking-widest mb-2">
              Message
            </p>
            <p className="text-sm text-bone/80 whitespace-pre-wrap">
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
          <p className="text-xs text-bone/60 uppercase tracking-widest mb-4">
            Decision
          </p>
          <ApplicationActions id={app.id} />
        </div>
      )}

      {app.status !== "pending" && (
        <div className="mt-6">
          <p className="text-sm text-bone/60">
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
      <p className="text-xs text-bone/60 uppercase tracking-widest sm:w-28 shrink-0 pt-px">
        {label}
      </p>
      <p className="text-sm text-bone/80">{value}</p>
    </div>
  );
}
