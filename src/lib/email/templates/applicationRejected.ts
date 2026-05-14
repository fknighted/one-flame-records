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

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#1A1612;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:48px 24px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1A1612;border:1px solid rgba(245,237,216,0.1);border-radius:8px;">
        <tr><td style="padding:40px 40px 32px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3F5A3A;font-family:Arial,sans-serif;">One Flame Records</p>
          <h1 style="margin:0 0 24px;font-size:24px;color:#F5EDD8;">Thanks for applying, ${stageName}.</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(245,237,216,0.7);">
            We&rsquo;ve reviewed your application and, after careful consideration, we&rsquo;re not moving forward at this time.
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:rgba(245,237,216,0.7);">
            This isn&rsquo;t a reflection of your talent — we receive many applications and can only take on a limited number of artists. We encourage you to keep making music and to apply again in the future.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(245,237,216,0.4);">
            — One Flame Records
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Thanks for applying, ${stageName}.

We've reviewed your application and, after careful consideration, we're not moving forward at this time.

This isn't a reflection of your talent — we receive many applications and can only take on a limited number of artists. We encourage you to keep making music and to apply again in the future.

— One Flame Records`;

  return { subject, html, text };
}
