"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function inviteBartender(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name  = (formData.get("name") as string)?.trim();

  if (!email) return { error: "Email is required." };
  if (!name)  return { error: "Name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role: "bartender", display_name: name },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`,
  });

  if (error) return { error: `Failed to send invite: ${error.message}` };

  revalidatePath("/admin/bar/staff");
  return null;
}

export async function deactivateBartender(userId: string): Promise<ActionState> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  if (error) return { error: `Failed to deactivate: ${error.message}` };
  revalidatePath("/admin/bar/staff");
  return null;
}
