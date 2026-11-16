"use server";

import { escapeHtml } from "@/lib/email/escape";
import { allowPublicForm } from "@/lib/form-limit";
import { Resend } from "resend";
import { EMAIL_COLORS, EMAIL_FONT_TEXT, emailLayout } from "@/lib/email/layout";
import { sendEmail } from "@/lib/email/send";
import { renderManagedEmail } from "@/lib/email/managed";
import { createServiceClient } from "@/lib/supabase/server";
import { ENQUIRY_TYPES, isEnquiryType } from "@/lib/contact-enquiries";

export type ContactState =
  | { status: "success" }
  | { status: "error"; message: string }
  | null;

const SEND_FAILED = "Failed to send your message. Please try again.";

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Honeypot — bots fill this, humans don't
  if (formData.get("website")) return { status: "success" };

  const name    = (formData.get("name") as string)?.trim();
  const email   = (formData.get("email") as string)?.trim();
  const reason  = (formData.get("reason") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { status: "error", message: "Please fill in all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  if (name.length>100 || email.length>254 || message.length>5000 || !isEnquiryType(reason)) return {status:"error",message:"Use a valid reason, a name up to 100 characters and a message up to 5,000 characters."};
  if (!await allowPublicForm("contact",email)) return {status:"error",message:"Please wait before sending another message."};
  const label = ENQUIRY_TYPES[reason];

  // Save first. If the record cannot be saved, the sender sees the same error
  // as a failed send today and nothing is emailed, so nothing is lost silently.
  const service = createServiceClient();
  const saved = await service
    .from("contact_enquiries")
    .insert({ enquiry_type: reason, name, email, message })
    .select("id")
    .single();
  if (saved.error || !saved.data) {
    console.error("Contact enquiry save failed:", saved.error?.message ?? "no record returned");
    return { status: "error", message: SEND_FAILED };
  }
  const id = saved.data.id;

  // From here the enquiry is safe in the admin list, so an email problem is
  // recorded on the enquiry instead of asking the sender to send a duplicate.
  let adminEmail: "sent" | "failed" = "failed";
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from   = process.env.RESEND_FROM_EMAIL ?? "noreply@oneflamerecords.com";
    const to     = process.env.ADMIN_EMAIL ?? "fknighted@gmail.com";

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[One Flame] ${label} — ${name}`,
      text: [
        `From: ${name} <${email}>`,
        `Reason: ${label}`,
        "",
        message,
      ].join("\n"),
      html: emailLayout({
        body: `<p style="margin:0 0 12px;font-family:${EMAIL_FONT_TEXT};font-size:17px;line-height:1.6;color:${EMAIL_COLORS.black};"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
        <p style="margin:0 0 20px;font-family:${EMAIL_FONT_TEXT};font-size:17px;line-height:1.6;color:${EMAIL_COLORS.black};"><strong>Reason:</strong> ${escapeHtml(label)}</p>
        <hr style="border:0;border-top:2px solid ${EMAIL_COLORS.black};margin:0 0 20px;" />
        <p style="margin:0;font-family:${EMAIL_FONT_TEXT};font-size:17px;line-height:1.6;color:${EMAIL_COLORS.black};white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    }, { idempotencyKey: `contact-admin/${id}` });

    if (error) console.error("Resend error:", error);
    else adminEmail = "sent";
  } catch (err) {
    console.error("Contact admin email failed:", err instanceof Error ? err.message : err);
  }

  // One automatic confirmation to the sender, keyed to this saved enquiry.
  let replyEmail: "sent" | "failed" = "failed";
  try {
    const reply = await renderManagedEmail("contact-confirmation");
    const { error } = await sendEmail({ to: email, ...reply, idempotencyKey: `contact-reply/${id}` });
    if (error) console.error("Contact confirmation email failed:", error);
    else replyEmail = "sent";
  } catch (err) {
    console.error("Contact confirmation email failed:", err instanceof Error ? err.message : err);
  }

  const status = await service
    .from("contact_enquiries")
    .update({ admin_email_status: adminEmail, reply_email_status: replyEmail })
    .eq("id", id);
  if (status.error) console.error("Contact enquiry email status not saved:", status.error.message);

  return { status: "success" };
}
