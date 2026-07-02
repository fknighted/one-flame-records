import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

type AppRow = Tables<"signup_applications">;

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-ochre/15 text-ochre",
  approved: "bg-forest/20 text-sage",
  rejected: "bg-oxblood/20 text-red-400",
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
      <p className="text-red-400 text-sm">
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage mb-2">
          QR Onboarding
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">
          Applications
        </h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
        {pending > 0 && (
          <p className="mt-3 text-sm text-ochre">
            {pending} pending review
          </p>
        )}
      </div>

      {!applications || applications.length === 0 ? (
        <div className="bg-bone/5 border border-bone/10 rounded-lg p-8 text-center">
          <p className="text-bone/50 text-sm">No applications yet.</p>
          <p className="text-bone/50 text-xs mt-1">
            Share a signup link from{" "}
            <Link href="/admin/codes" className="text-ochre hover:underline">
              Codes
            </Link>{" "}
            to start receiving applications.
          </p>
        </div>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b border-bone/10 text-xs text-bone/60">
            {total} total
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bone/10">
                <th className="text-left px-4 py-2.5 text-bone/60 font-normal text-xs">
                  Artist
                </th>
                <th className="text-left px-4 py-2.5 text-bone/60 font-normal text-xs hidden sm:table-cell">
                  Email
                </th>
                <th className="text-left px-4 py-2.5 text-bone/60 font-normal text-xs hidden md:table-cell">
                  Submitted
                </th>
                <th className="text-left px-4 py-2.5 text-bone/60 font-normal text-xs">
                  Status
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-bone/5 last:border-0 hover:bg-bone/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-bone font-medium">{app.stage_name}</p>
                    <p className="text-bone/60 text-xs">{app.legal_name}</p>
                  </td>
                  <td className="px-4 py-3 text-bone/60 hidden sm:table-cell">
                    {app.email}
                  </td>
                  <td className="px-4 py-3 text-bone/50 hidden md:table-cell">
                    {formatDate(app.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_BADGE[app.status] ?? "bg-bone/10 text-bone/50"}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="text-xs text-ochre hover:text-ochre/80 transition-colors"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
