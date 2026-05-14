"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Suspense } from "react";

function CallbackInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function handle() {
      // PKCE flow — code in query param
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.location.href = "/auth/set-password";
          return;
        }
      }

      // Implicit flow — tokens in hash fragment (generateLink / recovery links)
      const hash = window.location.hash.slice(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            window.location.href = "/auth/set-password";
            return;
          }
        }

        // OTP expired or other error in hash
        const errorCode = params.get("error_code") ?? params.get("error");
        window.location.href = `/login?error=${errorCode ?? "invite_expired"}`;
        return;
      }

      window.location.href = "/login?error=invite_expired";
    }

    handle();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-ink/40 text-sm">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-ink/40 text-sm">Signing you in…</p>
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
