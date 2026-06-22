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

export async function deactivateBartender(userId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: "876600h" });
  if (error) throw new Error(`Failed to deactivate: ${error.message}`);
  revalidatePath("/admin/bar/staff");
}

export async function reactivateBartender(userId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (error) throw new Error(`Failed to reactivate: ${error.message}`);
  revalidatePath("/admin/bar/staff");
}

export async function resendBartenderInvite(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const email = formData.get("email") as string;
  if (!email) return { error: "Email missing." };

  const supabase = createServiceClient();

  // generateLink type "recovery" works for confirmed users who need to set/reset
  // their password. For a user who clicked the invite link (auto-confirmed) but
  // never completed the set-password step, this is the correct flow.
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password` },
  });

  if (error) return { error: `Failed to generate link: ${error.message}` };

  const { sendEmail } = await import("@/lib/email/send");
  const link = data.properties.action_link;
  const { error: emailError } = await sendEmail({
    to: email,
    subject: "Set up your One Flame bar account",
    text: `You've been invited to the One Flame bar system. Click the link below to set your password:\n\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>You've been invited to the One Flame bar system.</p><p><a href="${link}">Set your password</a></p><p>This link expires in 24 hours.</p>`,
  });

  if (emailError) return { error: `Link generated but email failed: ${emailError}` };
  revalidatePath("/admin/bar/staff");
  return null;
}

/** Grant bar access to an existing user (artist or otherwise) by email. */
export async function assignBartenderFlag(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const supabase = createServiceClient();

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) return { error: `User lookup failed: ${listError.message}` };

  const found = users.find((u) => u.email?.toLowerCase() === email);
  if (!found) return { error: "No account found with that email address." };

  const { error } = await supabase
    .from("profiles")
    .update({ is_bartender: true })
    .eq("id", found.id);
  if (error) return { error: `Failed to grant bar access: ${error.message}` };

  revalidatePath("/admin/bar/staff");
  return null;
}

/** Revoke bar access from an artist who was promoted via is_bartender flag. */
export async function revokeBartenderFlag(userId: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_bartender: false })
    .eq("id", userId);
  if (error) throw new Error(`Failed to revoke bar access: ${error.message}`);
  revalidatePath("/admin/bar/staff");
}
