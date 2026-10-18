"use server";

import { allowPublicForm } from "@/lib/form-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { renderApplicationReceived } from "@/lib/email/templates/applicationReceived";

export type SignupState =
  | { status: "success" }
  | { status: "error"; message: string }
  | null;

export async function submitApplication(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  // Honeypot
  if (formData.get("website")) return { status: "success" };

  const code_id    = (formData.get("code_id") as string)?.trim();
  const stage_name = (formData.get("stage_name") as string)?.trim();
  const legal_name = (formData.get("legal_name") as string)?.trim();
  const email      = (formData.get("email") as string)?.trim();
  const phone      = (formData.get("phone") as string)?.trim() || null;
  const message    = (formData.get("message") as string)?.trim() || null;

  if (!code_id || !stage_name || !legal_name || !email) {
    return { status: "error", message: "Please fill in all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  if (stage_name.length>100 || legal_name.length>200 || email.length>254 || (phone?.length??0)>40 || (message?.length??0)>5000) return {status:"error",message:"Please shorten the application fields."};
  if (!await allowPublicForm("application",email,3)) return {status:"error",message:"Please wait before submitting another application."};
  const genresRaw = (formData.get("genres") as string) ?? "";
  const genres = genresRaw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  if(genresRaw.length>500 || genres.length>10 || genres.some(g=>g.length>50))return {status:"error",message:"Choose up to ten short genre names."};

  const socials = {
    instagram: (formData.get("socials_instagram") as string)?.trim() || null,
    tiktok:    (formData.get("socials_tiktok") as string)?.trim() || null,
    twitter:   (formData.get("socials_twitter") as string)?.trim() || null,
    youtube:   (formData.get("socials_youtube") as string)?.trim() || null,
  };

  if(Object.values(socials).some(value=>(value?.length??0)>300))return {status:"error",message:"Social links must be under 300 characters."};

  const supabase = createServiceClient();

  const { data: applicationId, error } = await supabase.rpc("submit_artist_application", {p_data:{
    code_id,
    stage_name,
    legal_name,
    email,
    phone,
    message,
    genres,
    socials,
  }});

  if (error) {
    console.error("Application insert error:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Notify admin — fire and forget (don't fail the submission if email fails)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && applicationId) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com";
    const adminUrl = `${siteUrl}/admin/applications/${applicationId}`;

    const template = renderApplicationReceived({
      stageName: stage_name,
      legalName: legal_name,
      email,
      phone,
      genres,
      message,
      adminUrl,
    });

    await sendEmail({ to: adminEmail, ...template });
  }

  return { status: "success" };
}
