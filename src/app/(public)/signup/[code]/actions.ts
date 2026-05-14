"use server";

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

  const genresRaw = (formData.get("genres") as string) ?? "";
  const genres = genresRaw
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  const socials = {
    instagram: (formData.get("socials_instagram") as string)?.trim() || null,
    tiktok:    (formData.get("socials_tiktok") as string)?.trim() || null,
    twitter:   (formData.get("socials_twitter") as string)?.trim() || null,
    youtube:   (formData.get("socials_youtube") as string)?.trim() || null,
  };

  const supabase = createServiceClient();

  const { error } = await supabase.from("signup_applications").insert({
    code_id,
    stage_name,
    legal_name,
    email,
    phone,
    message,
    genres,
    socials,
    status: "pending",
  });

  if (error) {
    console.error("Application insert error:", error);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Notify admin — fire and forget (don't fail the submission if email fails)
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com";
    const { data: inserted } = await supabase
      .from("signup_applications")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const adminUrl = inserted
      ? `${siteUrl}/admin/applications/${inserted.id}`
      : `${siteUrl}/admin/applications`;

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
