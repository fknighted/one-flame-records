"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "@/app/studio.css";

export default function SecondStepPage() {
  const [factor, setFactor] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let active = true;
    createClient().auth.mfa.listFactors().then(({ data, error }) => {
      if (!active) return;
      const verified = data?.totp.find(f => f.status === "verified");
      if (error || !verified) setError("No authenticator is available. Sign in again or contact the label.");
      else setFactor(verified.id);
    });
    return () => { active = false; };
  }, []);
  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factor || pending) return;
    setPending(true); setError(null);
    try {
      const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: factor, code });
      if (error) { setError("That code could not be verified. Try the current code."); return; }
      window.location.assign("/admin");
    } catch { setError("Verification could not connect. Please try again."); }
    finally { setPending(false); }
  }
  return <main className="studio-shell min-h-screen bg-black text-paper flex items-center justify-center p-4">
    <form onSubmit={verify} className="studio-card w-full max-w-sm space-y-4">
      <h1 className="studio-page-title">Verify your sign-in</h1>
      <p>Enter the current six-digit code from your authenticator app.</p>
      <label htmlFor="auth-code" className="studio-field-label">Authenticator code</label>
      <input id="auth-code" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required className="studio-field" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))}/>
      {error && <p role="alert" className="studio-error">{error}</p>}
      <button disabled={!factor || pending || code.length !== 6} className="studio-btn studio-btn-primary">{pending ? "Verifying…" : "Verify"}</button>
      <button type="button" className="studio-btn studio-btn-quiet" onClick={async()=>{await createClient().auth.signOut();window.location.assign("/login");}}>Sign out</button>
    </form>
  </main>;
}
