import {
  emailButton,
  emailLayout,
  emailParagraph,
  emailSmallPrint,
} from "@/lib/email/layout";

interface ApplicationApprovedData {
  stageName: string;
  portalInviteUrl: string;
}

export function renderApplicationApproved(data: ApplicationApprovedData): {
  subject: string;
  html: string;
  text: string;
} {
  const { stageName, portalInviteUrl } = data;

  const subject = "You're approved — set your One Flame portal password";

  const html = emailLayout({
    title: subject,
    heading: `You&rsquo;re in, ${stageName}.`,
    body: [
      emailParagraph(
        "Your application has been approved. Click below to set your password and access your artist portal."
      ),
      emailButton(portalInviteUrl, "Set Password &amp; Enter Portal"),
      emailSmallPrint(
        "This link expires in 24 hours. If you didn&rsquo;t expect this email, ignore it."
      ),
    ].join("\n"),
  });

  const text = `You're in, ${stageName}.

Your application to One Flame Records has been approved.

Set your password and access your artist portal:
${portalInviteUrl}

This link expires in 24 hours.`;

  return { subject, html, text };
}
