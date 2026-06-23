"use server";

import { Resend } from "resend";

export type ContactState =
  | { status: "success" }
  | { status: "error"; message: string }
  | null;

const REASONS: Record<string, string> = {
  general:           "General enquiry",
  press:             "Press & media",
  sync:              "Sync licensing",
  artist_submission: "Artist submission",
};

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

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from   = process.env.RESEND_FROM_EMAIL ?? "noreply@oneflamerecords.com";
  const to     = process.env.ADMIN_EMAIL ?? "fknighted@gmail.com";

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `[One Flame] ${REASONS[reason] ?? "Enquiry"} — ${name}`,
    text: [
      `From: ${name} <${email}>`,
      `Reason: ${REASONS[reason] ?? reason}`,
      "",
      message,
    ].join("\n"),
    html: `
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Reason:</strong> ${REASONS[reason] ?? reason}</p>
      <hr />
      <p style="white-space:pre-wrap">${message.replace(/</g, "&lt;")}</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return { status: "error", message: "Failed to send your message. Please try again." };
  }

  return { status: "success" };
}
