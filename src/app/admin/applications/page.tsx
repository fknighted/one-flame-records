import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type AppRow = Tables<"signup_applications">;

const STATUS_BADGE: Record<string, string> = {
  pending:  "studio-chip-neutral",
  approved: "studio-chip-ok",
  rejected: "studio-chip-bad",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminApplicationsPage() {
  const supabase = createServiceClient();

  const { data: applications, error } = await supabase
    .from("signup_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<AppRow[]>();

  if (error) {
    return (
      <p role="alert" className="studio-error">
        Failed to load applications: {error.message}
      </p>
    );
  }

  const pending  = applications?.filter((a) => a.status === "pending").length ?? 0;
  const total    = applications?.length ?? 0;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <p className="studio-label mb-2">QR Onboarding</p>
        <h1 className="studio-page-title">Applications</h1>
        {pending > 0 && (
          <p className="mt-3 text-[15px] text-paper">
            {pending} pending review
          </p>
        )}
      </div>

      {!applications || applications.length === 0 ? (
        <div className="studio-card text-center">
          <p className="text-muted">No applications yet.</p>
          <p className="text-muted text-[15px] mt-1">
            Share a signup link from{" "}
            <Link href="/admin/codes" className="studio-link inline-flex min-h-[44px] items-center">
              Codes
            </Link>{" "}
            to start receiving applications.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-[15px] text-muted">
            <span className="studio-count">{total}</span> total
          </p>
          <div className="studio-table-wrap">
          <table className="studio-table min-w-[640px]">
            <thead>
              <tr>
                <th>Artist</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden md:table-cell">Submitted</th>
                <th>Status</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <p className="font-semibold">{app.stage_name}</p>
                    <p className="text-muted text-[15px]">{app.legal_name}</p>
                  </td>
                  <td className="text-muted hidden sm:table-cell [overflow-wrap:anywhere]">
                    {app.email}
                  </td>
                  <td className="text-muted hidden md:table-cell whitespace-nowrap">
                    {formatDate(app.created_at)}
                  </td>
                  <td>
                    <span
                      className={`studio-chip capitalize ${STATUS_BADGE[app.status] ?? "studio-chip-neutral"}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="is-num">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="studio-btn studio-btn-secondary studio-btn-sm"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
