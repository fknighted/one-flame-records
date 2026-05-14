"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

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
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from =
        process.env.RESEND_FROM_EMAIL ??
        "One Flame Records <noreply@oneflamerecords.com>";

      const { error: emailError } = await resend.emails.send({
        from,
        to: app.email,
        subject: "You're approved — set your One Flame portal password",
        html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#1A1612;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1A1612;border:1px solid rgba(245,237,216,0.1);border-radius:8px;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3F5A3A;font-family:Arial,sans-serif;">One Flame Records</p>
          <h1 style="margin:0 0 24px;font-size:28px;color:#F5EDD8;">You&rsquo;re in.</h1>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:rgba(245,237,216,0.7);">
            Your application has been approved. Click below to set your password and access your artist portal.
          </p>
          <a href="${portalInviteUrl}" style="display:inline-block;background:#B8893B;color:#1A1612;text-decoration:none;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
            Set Password &amp; Enter Portal
          </a>
          <p style="margin:32px 0 0;font-size:12px;color:rgba(245,237,216,0.3);font-family:Arial,sans-serif;">
            This link expires in 24 hours. If you didn&rsquo;t expect this email, ignore it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });

      if (!emailError) return { success: true };
    } catch {
      // Fall through to link fallback
    }
  }

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

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}
