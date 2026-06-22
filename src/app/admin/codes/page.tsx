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
      color: { dark: "#1A1612", light: "#F5EDD8" },
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const rotateLabel = `Rotation — ${todayStr}`;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          QR Onboarding
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">
          Signup Codes
        </h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Active code */}
      {active && qrDataUri && signupUrl ? (
        <div className="bg-bone/5 border border-bone/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* QR */}
            <div className="shrink-0">
              <Image
                src={qrDataUri}
                alt="Signup QR code"
                width={160}
                height={160}
                className="rounded"
                unoptimized
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-bone/50 uppercase tracking-widest mb-1">
                Active code
              </p>
              <p className="text-bone font-semibold text-lg mb-1">
                {active.label}
              </p>
              <p className="font-mono text-sm text-ochre mb-3">
                {active.code}
              </p>

              <p className="text-xs text-bone/50 mb-1">Signup URL</p>
              <p className="text-sm text-bone/70 break-all mb-3">
                {signupUrl}
              </p>

              <div className="flex flex-wrap gap-4 items-center mb-6">
                <CopyButton text={signupUrl} label="Copy link" />
                <a
                  href={qrDataUri}
                  download="one-flame-signup-qr.png"
                  className="text-sm font-medium text-ochre hover:text-ochre/80 transition-colors"
                >
                  Download QR
                </a>
              </div>

              <div className="border-t border-bone/10 pt-4">
                <p className="text-xs text-bone/40 uppercase tracking-widest mb-3">
                  Rotate code
                </p>
                <GenerateCodeForm mode="rotate" defaultLabel={rotateLabel} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-bone/5 border border-bone/10 rounded-lg p-6 mb-8">
          <p className="text-bone/60 text-sm mb-4">
            No active code. Generate one to start onboarding artists.
          </p>
          <GenerateCodeForm mode="generate" />
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <div>
          <h2 className="text-bone/50 text-xs uppercase tracking-widest mb-3">
            Rotated codes
          </h2>
          <div className="border border-bone/10 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-bone/10">
                  <th className="text-left px-4 py-2 text-bone/40 font-normal text-xs">
                    Label
                  </th>
                  <th className="text-left px-4 py-2 text-bone/40 font-normal text-xs">
                    Code
                  </th>
                  <th className="text-left px-4 py-2 text-bone/40 font-normal text-xs">
                    Created
                  </th>
                  <th className="text-left px-4 py-2 text-bone/40 font-normal text-xs">
                    Rotated
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-b border-bone/5 last:border-0">
                    <td className="px-4 py-3 text-bone/70">{row.label}</td>
                    <td className="px-4 py-3 font-mono text-bone/50 text-xs">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 text-bone/50">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3 text-bone/50">
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
