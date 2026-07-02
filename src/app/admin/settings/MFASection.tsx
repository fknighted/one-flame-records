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
        <h2 className="text-sm font-semibold text-bone">Two-Factor Authentication</h2>
        <p className="text-xs text-bone/60 mt-1">
          Protect your admin account with an authenticator app (Google Authenticator, Authy, 1Password).
        </p>
      </div>

      {success && (
        <p className="text-sm text-sage">{success}</p>
      )}
      {error && (
        <p className="text-sm text-rose">{error}</p>
      )}

      {verified.length > 0 ? (
        <div className="space-y-2">
          {verified.map(f => (
            <div key={f.id} className="flex items-center justify-between border border-bone/10 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm text-bone font-medium">Authenticator app</p>
                <p className="text-xs text-bone/60">TOTP · Active</p>
              </div>
              <button
                onClick={() => unenroll(f.id)}
                className="text-xs text-rose/60 hover:text-rose transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : !enrolling ? (
        <button
          onClick={startEnroll}
          className="bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors"
        >
          Set up authenticator app
        </button>
      ) : null}

      {enrolling && qrCode && (
        <div className="space-y-4 border border-bone/10 rounded-lg p-4">
          <p className="text-sm text-bone">
            Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
          </p>
          <div
            className="bg-white rounded p-3 inline-block"
            dangerouslySetInnerHTML={{ __html: qrCode }}
          />
          <div className="flex gap-2 items-center">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-28 bg-bone/5 border border-bone/20 rounded px-3 py-2 text-bone text-sm font-mono text-center focus:outline-none focus:border-ochre/50"
            />
            <button
              onClick={verifyCode}
              disabled={code.length !== 6}
              className="bg-ochre text-ink text-sm font-medium px-4 py-2 rounded hover:bg-ochre/90 transition-colors disabled:opacity-50"
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
              className="text-sm text-bone/60 hover:text-bone transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
