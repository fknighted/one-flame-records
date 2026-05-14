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

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#1A1612;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1A1612;border:1px solid rgba(245,237,216,0.1);border-radius:8px;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3F5A3A;font-family:Arial,sans-serif;">One Flame Records</p>
          <h1 style="margin:0 0 24px;font-size:22px;color:#F5EDD8;">New application received</h1>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);width:120px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,237,216,0.4);font-family:Arial,sans-serif;vertical-align:top;">Stage name</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:14px;color:#F5EDD8;font-family:Arial,sans-serif;">${stageName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,237,216,0.4);font-family:Arial,sans-serif;vertical-align:top;">Legal name</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:14px;color:#F5EDD8;font-family:Arial,sans-serif;">${legalName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,237,216,0.4);font-family:Arial,sans-serif;vertical-align:top;">Email</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:14px;color:#F5EDD8;font-family:Arial,sans-serif;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,237,216,0.4);font-family:Arial,sans-serif;vertical-align:top;">Phone</td>
              <td style="padding:8px 0;border-bottom:1px solid rgba(245,237,216,0.06);font-size:14px;color:#F5EDD8;font-family:Arial,sans-serif;">${phone ?? "—"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;${message ? "border-bottom:1px solid rgba(245,237,216,0.06);" : ""}font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,237,216,0.4);font-family:Arial,sans-serif;vertical-align:top;">Genres</td>
              <td style="padding:8px 0;${message ? "border-bottom:1px solid rgba(245,237,216,0.06);" : ""}font-size:14px;color:#F5EDD8;font-family:Arial,sans-serif;">${genreList}</td>
            </tr>
            ${message ? `<tr>
              <td style="padding:8px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(245,237,216,0.4);font-family:Arial,sans-serif;vertical-align:top;">Message</td>
              <td style="padding:8px 0;font-size:14px;color:rgba(245,237,216,0.8);font-family:Arial,sans-serif;line-height:1.6;">${message.replace(/\n/g, "<br>")}</td>
            </tr>` : ""}
          </table>

          <a href="${adminUrl}" style="display:inline-block;background:#B8893B;color:#1A1612;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
            Review Application
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

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
