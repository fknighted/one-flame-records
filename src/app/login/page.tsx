"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoMark from "@/components/LogoMark";
import "@/app/studio.css";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<"login" | "reset">("login");
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setPending(false);
      return;
    }

    // Proxy handles role-based routing with service role — just go to /admin.
    // Non-admin users are redirected to /portal by the proxy.
    window.location.href = "/admin";
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/set-password`,
    });

    setPending(false);

    if (resetError) {
      setError("Failed to send reset email. Please try again.");
      return;
    }

    setResetSuccess(true);
  }

  return (
    <main className="studio-shell min-h-screen bg-black text-paper font-text flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoMark
            variant="stacked"
            ground="black"
            height={128}
            className="h-32 w-auto mx-auto mb-5"
            priority
          />
          <p className="text-[15px] text-muted">
            {view === "login" ? "Sign in to continue" : "Reset password"}
          </p>
        </div>

        {view === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="studio-field-label"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="studio-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="studio-field-label"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="studio-field"
              />
            </div>

            {error && <p className="studio-error">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="studio-btn studio-btn-primary w-full"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setView("reset"); setError(null); }}
              className="studio-btn studio-btn-quiet studio-btn-sm w-full mt-1"
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="space-y-4">
                <p className="text-[15px] text-paper text-center">
                  Check your email — a reset link is on its way.
                </p>
                <button
                  type="button"
                  onClick={() => { setView("login"); setResetSuccess(false); setError(null); }}
                  className="studio-btn studio-btn-quiet studio-btn-sm w-full"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-[15px] text-muted text-center">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                <div>
                  <label
                    htmlFor="reset-email"
                    className="studio-field-label"
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="studio-field"
                    placeholder="you@example.com"
                  />
                </div>

                {error && <p className="studio-error">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="studio-btn studio-btn-primary w-full"
                >
                  {pending ? "Sending…" : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={() => { setView("login"); setError(null); }}
                  className="studio-btn studio-btn-quiet studio-btn-sm w-full"
                >
                  Back to sign in
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
