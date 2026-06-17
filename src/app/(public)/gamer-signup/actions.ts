"use server";

import { createServiceClient } from "@/lib/supabase/server";

export type GamerSignupState =
  | { success: true }
  | { error: string }
  | null;

export async function gamerSignup(
  _prev: GamerSignupState,
  formData: FormData
): Promise<GamerSignupState> {
  const displayName = (formData.get("display_name") as string)?.trim();
  const email       = (formData.get("email") as string)?.trim().toLowerCase();

  if (!displayName) return { error: "Display name is required." };
  if (!email)       return { error: "Email address is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };

  const supabase = createServiceClient();

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
