import {
  EMAIL_COLORS,
  EMAIL_FONT_TEXT,
  emailButton,
  emailLayout,
  emailParagraph,
} from "@/lib/email/layout";

interface WelcomeData {
  stageName: string;
  portalUrl: string;
}

export function renderWelcome(data: WelcomeData): {
  subject: string;
  html: string;
  text: string;
} {
  const { stageName, portalUrl } = data;

  const subject = "Welcome to One Flame Records";

  const item = (title: string, desc: string, last = false) =>
    `<tr>
              <td style="padding:12px 0;${last ? "" : `border-bottom:1px solid ${EMAIL_COLORS.black};`}">
                <p style="margin:0;font-family:${EMAIL_FONT_TEXT};font-size:16px;line-height:1.3;font-weight:800;color:${EMAIL_COLORS.black};">${title}</p>
                <p style="margin:4px 0 0;font-family:${EMAIL_FONT_TEXT};font-size:15px;line-height:1.5;color:${EMAIL_COLORS.black};">${desc}</p>
              </td>
            </tr>`;

  const html = emailLayout({
    title: subject,
    heading: `Welcome, ${stageName}.`,
    body: [
      emailParagraph(
        "You&rsquo;re now part of One Flame Records. Here&rsquo;s what you can do in your artist portal:"
      ),
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
            ${item("Profile", "Update your bio, photo, and social links.")}
            ${item("Assets", "Upload instrumentals, demos, and reference files.")}
            ${item("Videos", "Watch and manage your saved videos.", true)}
          </table>`,
      emailButton(portalUrl, "Go to Your Portal"),
    ].join("\n"),
  });

  const text = `Welcome to One Flame Records, ${stageName}.

You're now part of the label. Here's what you can do in your artist portal:

Profile — Update your bio, photo, and social links.
Assets — Upload instrumentals, demos, and reference files.
Videos — Watch and manage your saved videos.

Go to your portal: ${portalUrl}`;

  return { subject, html, text };
}
