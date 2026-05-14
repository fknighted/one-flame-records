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

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#1A1612;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1A1612;border:1px solid rgba(245,237,216,0.1);border-radius:8px;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3F5A3A;font-family:Arial,sans-serif;">One Flame Records</p>
          <h1 style="margin:0 0 8px;font-size:28px;color:#F5EDD8;">You&rsquo;re in, ${stageName}.</h1>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:rgba(245,237,216,0.7);">
            Your application has been approved. Click below to set your password and access your artist portal.
          </p>
          <a href="${portalInviteUrl}" style="display:inline-block;background:#B8893B;color:#1A1612;text-decoration:none;padding:14px 28px;border-radius:4px;font-size:14px;font-weight:600;font-family:Arial,sans-serif;">
            Set Password &amp; Enter Portal
          </a>
          <p style="margin:32px 0 0;font-size:12px;color:rgba(245,237,216,0.3);font-family:Arial,sans-serif;">
            This link expires in 24 hours. If you didn&rsquo;t expect this email, ignore it.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `You're in, ${stageName}.

Your application to One Flame Records has been approved.

Set your password and access your artist portal:
${portalInviteUrl}

This link expires in 24 hours.`;

  return { subject, html, text };
}
