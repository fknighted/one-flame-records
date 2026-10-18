"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";
import { renderApplicationApproved } from "@/lib/email/templates/applicationApproved";
import { renderApplicationRejected } from "@/lib/email/templates/applicationRejected";

export type ActionState = { error: string } | { success: true } | { link: string } | null;

export async function approveApplication(_prev: ActionState, data: FormData): Promise<ActionState> {
 await requireAdmin(); const id=String(data.get("id")??""); if(!id)return {error:"Missing application ID."};
 const service=createServiceClient(); const {data:{user:admin}}=await (await createClient()).auth.getUser();
 if(!admin)return {error:"Not authenticated."};
 const claim=await service.rpc("claim_application",{p_id:id});
 if(claim.error || !claim.data)return {error:claim.error?.message??"Could not claim application."};
 const application=claim.data as {email:string;provisioned_user_id:string|null};
 let userId=application.provisioned_user_id;
 if(!userId){
  // Create no email side effect before the database profile is linked. If the
  // response is lost, the next claim locates this unlinked account by email.
  const created=await service.auth.admin.createUser({email:application.email,email_confirm:true});
  if(created.error || !created.data.user)return {error:"Could not create account. Wait five minutes, then retry; existing accounts are recovered safely."};
  userId=created.data.user.id;
  const saved=await service.from("signup_applications").update({provisioned_user_id:userId}).eq("id",id);
  if(saved.error)return {error:"Account created but approval is incomplete. Wait five minutes and retry."};
 }
 const finished=await service.rpc("finish_application",{p_id:id,p_user:userId,p_admin:admin.id});
 if(finished.error)return {error:finished.error.message};
 revalidatePath("/admin/applications");
 const result=await resendInvite(null,data);
 if(result && "error" in result)return {error:`Approved; invitation needs retry. ${result.error}`};
 return result;
}

export async function resendInvite(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
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
  await requireAdmin();
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

  const { data:reviewed, error } = await supabase
    .from("signup_applications")
    .update({
      status: "rejected",
      reviewed_by: adminUser?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status","pending")
    .or(`approval_lease_until.is.null,approval_lease_until.lt.${new Date().toISOString()}`)
    .select("id").maybeSingle();

  if (error || !reviewed) {
    return { error: error ? `Failed to reject application: ${error.message}` : "This application changed or is being approved. Refresh first." };
  }

  // Send rejection email — fire and forget (don't fail the action if email fails)
  const template = renderApplicationRejected({ stageName: app.stage_name });
  await sendEmail({ to: app.email, ...template });

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}
