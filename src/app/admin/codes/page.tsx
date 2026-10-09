import QRCode from "qrcode";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import CopyButton from "@/components/CopyButton";
import GenerateCodeForm from "@/components/GenerateCodeForm";
import type { Tables } from "@/types/supabase";

type CodeRow = Tables<"signup_codes">;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminCodesPage() {
  const supabase = createServiceClient();

  const [{ data: active }, { data: history }] = await Promise.all([
    supabase
      .from("signup_codes")
      .select("*")
      .eq("is_active", true)
      .maybeSingle<CodeRow>(),
    supabase
      .from("signup_codes")
      .select("*")
      .eq("is_active", false)
      .order("rotated_at", { ascending: false })
      .limit(20)
      .returns<CodeRow[]>(),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com";

  let signupUrl: string | null = null;
  let qrDataUri: string | null = null;

  if (active) {
    signupUrl = `${siteUrl}/signup/${active.code}`;
    qrDataUri = await QRCode.toDataURL(signupUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#0F0D0B", light: "#FFF7E6" },
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const rotateLabel = `Rotation — ${todayStr}`;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <p className="studio-label mb-2">QR Onboarding</p>
        <h1 className="studio-page-title">Signup Codes</h1>
      </div>

      {/* Active code */}
      {active && qrDataUri && signupUrl ? (
        <div className="studio-card mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* QR */}
            <div className="shrink-0">
              <Image
                src={qrDataUri}
                alt="Signup QR code"
                width={160}
                height={160}
                className="border border-line"
                unoptimized
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="studio-label mb-1">
                Active code
              </p>
              <p className="studio-section-title mb-1">
                {active.label}
              </p>
              <p className="studio-figures text-paper mb-3 [overflow-wrap:anywhere]">
                {active.code}
              </p>

              <p className="studio-hint mb-1">Signup URL</p>
              <p className="text-[15px] text-paper break-all mb-3">
                {signupUrl}
              </p>

              <div className="flex flex-wrap gap-4 items-center mb-6">
                <CopyButton text={signupUrl} label="Copy link" />
                <a
                  href={qrDataUri}
                  download="one-flame-signup-qr.png"
                  className="studio-btn studio-btn-secondary studio-btn-sm"
                >
                  Download QR
                </a>
              </div>

              <div className="studio-divider pt-4">
                <p className="studio-label mb-3">
                  Rotate code
                </p>
                <GenerateCodeForm mode="rotate" defaultLabel={rotateLabel} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="studio-card mb-8">
          <p className="text-muted mb-4">
            No active code. Generate one to start onboarding artists.
          </p>
          <GenerateCodeForm mode="generate" />
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <div>
          <h2 className="studio-section-title mb-3">
            Rotated codes
          </h2>
          <div className="studio-table-wrap">
            <table className="studio-table min-w-[480px]">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Code</th>
                  <th>Created</th>
                  <th>Rotated</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td className="studio-figures text-muted">
                      {row.code}
                    </td>
                    <td className="text-muted whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="text-muted whitespace-nowrap">
                      {formatDate(row.rotated_at)}
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
