import { emailLayout, emailParagraph } from "@/lib/email/layout";

interface ApplicationRejectedData {
  stageName: string;
}

export function renderApplicationRejected(data: ApplicationRejectedData): {
  subject: string;
  html: string;
  text: string;
} {
  const { stageName } = data;

  const subject = "One Flame Records — Application Update";

  const html = emailLayout({
    title: subject,
    heading: `Thanks for applying, ${stageName}.`,
    body: [
      emailParagraph(
        "We&rsquo;ve reviewed your application and, after careful consideration, we&rsquo;re not moving forward at this time."
      ),
      emailParagraph(
        "This isn&rsquo;t a reflection of your talent — we receive many applications and can only take on a limited number of artists. We encourage you to keep making music and to apply again in the future."
      ),
      emailParagraph("— One Flame Records", { last: true }),
    ].join("\n"),
  });

  const text = `Thanks for applying, ${stageName}.

We've reviewed your application and, after careful consideration, we're not moving forward at this time.

This isn't a reflection of your talent — we receive many applications and can only take on a limited number of artists. We encourage you to keep making music and to apply again in the future.

— One Flame Records`;

  return { subject, html, text };
}
