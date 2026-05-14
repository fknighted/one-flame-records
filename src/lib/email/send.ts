"use server";

import { Resend } from "resend";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(
  opts: SendEmailOptions
): Promise<{ error?: string }> {
  if (!process.env.RESEND_API_KEY) return { error: "RESEND_API_KEY not set" };

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.RESEND_FROM_EMAIL ??
      "One Flame Records <noreply@oneflamerecords.com>";

    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    if (error) return { error: error.message };
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
