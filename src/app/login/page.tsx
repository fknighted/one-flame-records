"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo-1.png"
            alt="One Flame Records"
            width={320}
            height={175}
            className="h-20 w-auto mx-auto mb-4"
            priority
          />
          <p className="text-sm text-ink/60">Sign in to continue</p>
        </div>

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
        </form>
      </div>
    </main>
  );
}
