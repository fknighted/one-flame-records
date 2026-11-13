import { escapeHtml } from '@/lib/email/escape';
import { EMAIL_COLORS, EMAIL_FONT_TEXT, emailParagraph } from '@/lib/email/layout';

export const PARTNER_EMAIL_BRAND='<!-- flames-partner-email:v1 -->';

// Reuse the verified sending address, with the programme's own display name.
export function partnerSender(configured:string):string {
  const address=(configured.match(/<([^<>]+)>\s*$/)?.[1]??configured).trim();
  if(/[\r\n]/.test(configured)||!/^[-a-zA-Z0-9.!#$%&'*+/=?^_`{|}~]+@[-a-zA-Z0-9.]+$/.test(address))throw Error('The programme sender address needs review.');
  return `Flames Partner <${address}>`;
}

export function renderPartnerEmail(subject:string,text:string,secureLinks:readonly string[]=[]):string {
  const links=new Set(secureLinks.map(escapeHtml));
  const body=text.split('\n').map(line=>emailParagraph(escapeHtml(line).replace(/https?:\/\/[^ ]+/g,url=>links.has(url)?`<a href="${url}" style="color:${EMAIL_COLORS.red};text-decoration:underline;">Open secure link</a>`:url))).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head><body style="margin:0;background:${EMAIL_COLORS.black};font-family:${EMAIL_FONT_TEXT};">${PARTNER_EMAIL_BRAND}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td style="padding:32px;background:${EMAIL_COLORS.black};color:${EMAIL_COLORS.yellow};font-size:28px;font-weight:700;">FLAMES PARTNER</td></tr>
<tr><td style="height:4px;background:${EMAIL_COLORS.yellow};font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:32px;background:${EMAIL_COLORS.paper};color:${EMAIL_COLORS.black};"><h1 style="margin:0 0 24px;font-size:24px;">${escapeHtml(subject)}</h1>${body}</td></tr>
<tr><td style="padding:24px 32px;color:${EMAIL_COLORS.muted};font-size:14px;">Flames Partner</td></tr>
</table></td></tr></table></body></html>`;
}
