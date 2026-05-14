"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { renderApplicationApproved } from "@/lib/email/templates/applicationApproved";
import { renderApplicationRejected } from "@/lib/email/templates/applicationRejected";

export type ActionState = { error: string } | { success: true } | { link: string } | null;

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function approveApplication(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Missing application ID." };

  const supabase = createServiceClient();
  const sessionClient = await createClient();
  const {
    data: { user: adminUser },
  } = await sessionClient.auth.getUser();

  const { data: app, error: fetchError } = await supabase
    .from("signup_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !app) return { error: "Application not found." };
  if (app.status !== "pending")
    return { error: `Application is already ${app.status}.` };

  // 1. Invite via Supabase Admin — creates auth.users row, fires handle_new_user
  //    trigger (creates profiles row), and sends invite email.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com";
  const { data: inviteData, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(app.email, {
      redirectTo: `${siteUrl}/auth/callback`,
    });

  if (inviteError || !inviteData?.user) {
    return {
      error: `Failed to create artist account: ${inviteError?.message ?? "unknown error"}`,
    };
  }

  const userId = inviteData.user.id;

  // 2. Create artists row
  const baseSlug = toSlug(app.stage_name) || `artist-${Date.now()}`;
  const { data: existingSlug } = await supabase
    .from("artists")
    .select("id")
    .eq("slug", baseSlug)
    .maybeSingle();
  const slug = existingSlug ? `${baseSlug}-${Date.now()}` : baseSlug;

  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .insert({
      stage_name: app.stage_name,
      legal_name: app.legal_name,
      slug,
      genres: app.genres,
      socials: app.socials ?? {},
      bio: "",
      status: "pending",
    })
    .select("id")
    .single();

  if (artistError || !artist) {
    return {
      error: `Failed to create artist record: ${artistError?.message ?? "unknown error"}`,
    };
  }

  // 3. Link profiles.artist_id (profile row already exists via trigger)
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ artist_id: artist.id })
    .eq("id", userId);

  if (profileError) {
    return { error: `Failed to link profile: ${profileError.message}` };
  }

  // 4. Mark application approved
  const { error: updateError } = await supabase
    .from("signup_applications")
    .update({
      status: "approved",
      reviewed_by: adminUser?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return {
      error: `Failed to update application status: ${updateError.message}`,
    };
  }

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}

export async function resendInvite(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Missing application ID." };

  const supabase = createServiceClient();
  const { data: app, error: fetchError } = await supabase
    .from("signup_applications")
    .select("email, status")
    .eq("id", id)
    .single();

  if (fetchError || !app) return { error: "Application not found." };
  if (app.status !== "approved")
    return { error: "Can only resend invite for approved applications." };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com";
  const { data, error: linkError } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: app.email,
    options: { redirectTo: `${siteUrl}/auth/callback` },
  });

  if (linkError || !data?.properties?.action_link)
    return { error: `Failed to generate link: ${linkError?.message ?? "unknown error"}` };

  const portalInviteUrl = `${siteUrl}/auth/portal-invite?to=${encodeURIComponent(data.properties.action_link)}`;

  // Try Resend — falls back to returning the link if DNS isn't verified yet
  const { data: appData } = await supabase
    .from("signup_applications")
    .select("stage_name")
    .eq("id", id)
    .single();

  const template = renderApplicationApproved({
    stageName: appData?.stage_name ?? "Artist",
    portalInviteUrl,
  });

  const { error: emailError } = await sendEmail({ to: app.email, ...template });
  if (!emailError) return { success: true };

  // Resend unavailable or failed — return link for manual sending
  return { link: portalInviteUrl };
}

export async function rejectApplication(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Missing application ID." };

  const supabase = createServiceClient();
  const sessionClient = await createClient();
  const {
    data: { user: adminUser },
  } = await sessionClient.auth.getUser();

  const { data: app, error: fetchError } = await supabase
    .from("signup_applications")
    .select("email, stage_name")
    .eq("id", id)
    .single();

  if (fetchError || !app) return { error: "Application not found." };

  const { error } = await supabase
    .from("signup_applications")
    .update({
      status: "rejected",
      reviewed_by: adminUser?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: `Failed to reject application: ${error.message}` };
  }

  // Send rejection email — fire and forget (don't fail the action if email fails)
  const template = renderApplicationRejected({ stageName: app.stage_name });
  await sendEmail({ to: app.email, ...template });

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}
