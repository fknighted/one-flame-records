"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type Factor = { id: string; friendly_name?: string; factor_type: string; status: string };

export default function MFASection() {
  const [factors, setFactors]     = useState<Factor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode]       = useState<string | null>(null);
  const [factorId, setFactorId]   = useState<string | null>(null);
  const [code, setCode]           = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  async function loadFactors() {
    const supabase = getSupabase();
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  }

  useEffect(() => { loadFactors(); }, []);

  async function startEnroll() {
    setError(null);
    setEnrolling(true);
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (error || !data) {
      setError(error?.message ?? "Enrollment failed.");
      setEnrolling(false);
      return;
    }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
  }

  async function verifyCode() {
    if (!factorId || code.length !== 6) return;
    setError(null);
    const supabase = getSupabase();
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess("Two-factor authentication enabled.");
    setEnrolling(false);
    setQrCode(null);
    setFactorId(null);
    setCode("");
    loadFactors();
  }

  async function unenroll(id: string) {
    if (!confirm("Disable two-factor authentication?")) return;
    const supabase = getSupabase();
    await supabase.auth.mfa.unenroll({ factorId: id });
    setSuccess("Two-factor authentication disabled.");
    loadFactors();
  }

  const verified = factors.filter(f => f.status === "verified");

  if (loading) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="studio-section-title">Two-Factor Authentication</h2>
        <p className="text-[15px] text-muted mt-1">
          Protect your admin account with an authenticator app (Google Authenticator, Authy, 1Password).
        </p>
      </div>

      {success && (
        <p role="status" className="studio-success">{success}</p>
      )}
      {error && (
        <p role="alert" className="studio-error">{error}</p>
      )}

      {verified.length > 0 ? (
        <div className="space-y-2">
          {verified.map(f => (
            <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 studio-card">
              <div>
                <p className="font-semibold">Authenticator app</p>
                <p className="text-[15px] text-muted">TOTP · Active</p>
              </div>
              <button
                onClick={() => unenroll(f.id)}
                className="studio-btn studio-btn-danger studio-btn-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : !enrolling ? (
        <button
          onClick={startEnroll}
          className="studio-btn studio-btn-primary"
        >
          Set up authenticator app
        </button>
      ) : null}

      {enrolling && qrCode && (
        <div className="space-y-4 studio-card">
          <p className="text-paper">
            Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
          </p>
          <div
            className="bg-white p-3 inline-block"
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              aria-label="6-digit code"
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              className="studio-field studio-figures w-32 text-center"
            />
            <button
              onClick={verifyCode}
              disabled={code.length !== 6}
              className="studio-btn studio-btn-primary"
            >
              Verify
            </button>
            <button
              onClick={() => {
                setEnrolling(false);
                setQrCode(null);
                setFactorId(null);
                setCode("");
                setError(null);
              }}
              className="studio-btn studio-btn-quiet studio-btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
