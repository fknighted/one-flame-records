"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_bartender")
      .eq("id", user!.id)
      .single();

    const role = profile?.role;
    if (role === "admin") window.location.href = "/admin";
    else if (role === "bartender" || profile?.is_bartender) window.location.href = "/bar";
    else if (role === "artist") window.location.href = "/portal";
    else if (role === "gamer") window.location.href = "/gamer";
    else window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl text-oxblood mb-2">
            One Flame Records
          </h1>
          <p className="text-ink/60 text-sm">Set a password to access your portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-ink/20 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-oxblood focus:outline-none"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-ink/50">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded border border-ink/20 bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-oxblood focus:outline-none"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-ochre py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ochre/90 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Set Password & Enter Portal"}
          </button>
        </form>
      </div>
    </div>
  );
}
