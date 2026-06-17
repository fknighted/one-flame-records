"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function inviteGamer(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const displayName = (formData.get("display_name") as string)?.trim();
  const email       = (formData.get("email") as string)?.trim().toLowerCase();

  if (!displayName) return { error: "Display name is required." };
  if (!email)       return { error: "Email is required." };

  const supabase = createServiceClient();

  // Invite via Supabase Auth with gamer role
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role: "gamer" },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`,
  });

  if (inviteError) return { error: `Invite failed: ${inviteError.message}` };

  // Create gamer_members row immediately (profile trigger creates profiles row)
  if (inviteData?.user) {
    await supabase.from("gamer_members").insert({
      auth_user_id: inviteData.user.id,
      display_name: displayName,
      email,
    });
  }

  redirect("/bar/members");
}
