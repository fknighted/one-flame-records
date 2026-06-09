"use server";

import { Resend } from "resend";
import { marked } from "marked";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type NewsletterState = { error?: string; sent?: number } | null;

export async function sendNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  await requireAdmin();

  const subject = (formData.get("subject") as string)?.trim();
  const body    = (formData.get("body") as string)?.trim();

  if (!subject) return { error: "Subject is required." };
  if (!body)    return { error: "Body is required." };
  if (!process.env.RESEND_API_KEY) return { error: "RESEND_API_KEY not configured." };

  const supabase = createServiceClient();
  const { data: subscribers } = await supabase
    .from("fan_subscribers")
    .select("email")
    .eq("status", "active");

  if (!subscribers?.length) return { sent: 0 };

  const html = await marked(body);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@oneflamerecords.com";

  // Resend batch: max 100 per call
  let sent = 0;
  for (let i = 0; i < subscribers.length; i += 100) {
    const batch = subscribers.slice(i, i + 100);
    const { error: batchErr } = await resend.batch.send(
      batch.map((s) => ({
        from,
        to: s.email,
        subject,
        html: `${html}<p style="font-size:12px;color:#888;margin-top:32px;">You're receiving this because you subscribed at oneflamerecords.com. Reply to unsubscribe.</p>`,
      }))
    );
    if (batchErr) return { error: `Send failed after ${sent} emails: ${batchErr.message}`, sent };
    sent += batch.length;
  }

  return { sent };
}
