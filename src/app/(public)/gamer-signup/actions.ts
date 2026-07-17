"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

export type GamerSignupState =
  | { success: true }
  | { error: string }
  | null;

// Max invite emails a single source may trigger within the window.
const THROTTLE_MAX = 5;
const THROTTLE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function gamerSignup(
  _prev: GamerSignupState,
  formData: FormData
): Promise<GamerSignupState> {
  // Honeypot — bots fill hidden fields; humans never see it. Pretend success.
  if (formData.get("website")) return { success: true };

  const displayName = (formData.get("display_name") as string)?.trim();
  const email       = (formData.get("email") as string)?.trim().toLowerCase();

  if (!displayName) return { error: "Display name is required." };
  if (!email)       return { error: "Email address is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };

  const supabase = createServiceClient();

  // Rate-limit per source IP so this unauthenticated endpoint can't be used to
  // blast invite emails at arbitrary addresses from the One Flame domain.
  const hdrs = await headers();
  const ip = (hdrs.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const key = `gamer-signup:${ip}`;
  const windowStart = new Date(Date.now() - THROTTLE_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("signup_throttle")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gte("created_at", windowStart);
  if ((count ?? 0) >= THROTTLE_MAX) {
    return { error: "Too many signups from this connection. Please try again later." };
  }
  await supabase.from("signup_throttle").insert({ key });

  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role: "gamer" },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`,
  });

  if (inviteError) {
    if (inviteError.message.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  if (inviteData?.user) {
    await supabase.from("gamer_members").insert({
      auth_user_id: inviteData.user.id,
      display_name: displayName,
      email,
    });
  }

  return { success: true };
}
