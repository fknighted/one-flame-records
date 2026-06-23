"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo-1.png"
            alt="One Flame Records"
            width={320}
            height={175}
            className="h-40 w-auto mx-auto mb-4"
            priority
          />
          <p className="text-sm text-ink/60">
            {view === "login" ? "Sign in to continue" : "Reset password"}
          </p>
        </div>

        {view === "login" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ink mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded border border-ink/20 bg-bone px-3 py-2 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ink mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded border border-ink/20 bg-bone px-3 py-2 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
              />
            </div>

            {error && <p className="text-sm text-oxblood">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 disabled:opacity-50 transition-colors"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => { setView("reset"); setError(null); }}
              className="w-full text-center text-xs text-ink/40 hover:text-ink/70 transition-colors mt-1"
            >
              Forgot password?
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {resetSuccess ? (
              <div className="space-y-4">
                <p className="text-sm text-ink/70 text-center">
                  Check your email — a reset link is on its way.
                </p>
                <button
                  type="button"
                  onClick={() => { setView("login"); setResetSuccess(false); setError(null); }}
                  className="w-full text-center text-xs text-ink/40 hover:text-ink/70 transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <p className="text-sm text-ink/60 text-center">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-ink mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded border border-ink/20 bg-bone px-3 py-2 text-sm text-ink placeholder-ink/40 focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood"
                    placeholder="you@example.com"
                  />
                </div>

                {error && <p className="text-sm text-oxblood">{error}</p>}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded bg-ochre px-4 py-2 text-sm font-semibold text-ink hover:bg-ochre/90 disabled:opacity-50 transition-colors"
                >
                  {pending ? "Sending…" : "Send reset link"}
                </button>

                <button
                  type="button"
                  onClick={() => { setView("login"); setError(null); }}
                  className="w-full text-center text-xs text-ink/40 hover:text-ink/70 transition-colors"
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
