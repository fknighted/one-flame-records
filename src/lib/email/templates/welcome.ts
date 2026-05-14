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

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#1A1612;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1A1612;border:1px solid rgba(245,237,216,0.1);border-radius:8px;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3F5A3A;font-family:Arial,sans-serif;">One Flame Records</p>
          <h1 style="margin:0 0 8px;font-size:28px;color:#F5EDD8;">Welcome, ${stageName}.</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:rgba(245,237,216,0.7);">
            You&rsquo;re now part of One Flame Records. Here&rsquo;s what you can do in your artist portal:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(245,237,216,0.06);">
                <p style="margin:0;font-size:13px;color:#B8893B;font-family:Arial,sans-serif;font-weight:600;">Profile</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(245,237,216,0.6);font-family:Arial,sans-serif;">Update your bio, photo, and social links.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid rgba(245,237,216,0.06);">
                <p style="margin:0;font-size:13px;color:#B8893B;font-family:Arial,sans-serif;font-weight:600;">Assets</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(245,237,216,0.6);font-family:Arial,sans-serif;">Upload instrumentals, demos, and reference files.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <p style="margin:0;font-size:13px;color:#B8893B;font-family:Arial,sans-serif;font-weight:600;">Videos</p>
                <p style="margin:4px 0 0;font-size:13px;color:rgba(245,237,216,0.6);font-family:Arial,sans-serif;">Request AI-generated music videos for your tracks.</p>
              </td>
            </tr>
          </table>

          <a href="${portalUrl}" style="display:inline-block;background:#B8893B;color:#1A1612;text-decoration:none;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
            Go to Your Portal
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome to One Flame Records, ${stageName}.

You're now part of the label. Here's what you can do in your artist portal:

Profile — Update your bio, photo, and social links.
Assets — Upload instrumentals, demos, and reference files.
Videos — Request AI-generated music videos for your tracks.

Go to your portal: ${portalUrl}`;

  return { subject, html, text };
}
