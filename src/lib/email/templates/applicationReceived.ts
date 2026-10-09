import {
  EMAIL_COLORS,
  EMAIL_FONT_TEXT,
  emailButton,
  emailLayout,
} from "@/lib/email/layout";

interface ApplicationReceivedData {
  stageName: string;
  legalName: string;
  email: string;
  phone?: string | null;
  genres: string[];
  message?: string | null;
  adminUrl: string;
}

export function renderApplicationReceived(data: ApplicationReceivedData): {
  subject: string;
  html: string;
  text: string;
} {
  const { stageName, legalName, email, phone, genres, message, adminUrl } = data;

  const genreList = genres.length > 0 ? genres.join(", ") : "—";

  const subject = `New application: ${stageName}`;

  const row = (label: string, value: string, last = false) =>
    `<tr>
              <td width="120" valign="top" style="padding:10px 12px 10px 0;${last ? "" : `border-bottom:1px solid ${EMAIL_COLORS.black};`}font-family:${EMAIL_FONT_TEXT};font-size:13px;line-height:1.4;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_COLORS.black};">${label}</td>
              <td valign="top" style="padding:10px 0;${last ? "" : `border-bottom:1px solid ${EMAIL_COLORS.black};`}font-family:${EMAIL_FONT_TEXT};font-size:16px;line-height:1.5;color:${EMAIL_COLORS.black};">${value}</td>
            </tr>`;

  const html = emailLayout({
    title: subject,
    heading: "New application received",
    body: [
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
            ${row("Stage name", stageName)}
            ${row("Legal name", legalName)}
            ${row("Email", email)}
            ${row("Phone", `${phone ?? "—"}`)}
            ${row("Genres", genreList, !message)}
            ${message ? row("Message", message.replace(/\n/g, "<br>"), true) : ""}
          </table>`,
      emailButton(adminUrl, "Review Application"),
    ].join("\n"),
  });

  const text = `New application: ${stageName}

Stage name: ${stageName}
Legal name: ${legalName}
Email: ${email}
Phone: ${phone ?? "—"}
Genres: ${genreList}
${message ? `\nMessage:\n${message}\n` : ""}
Review: ${adminUrl}`;

  return { subject, html, text };
}
