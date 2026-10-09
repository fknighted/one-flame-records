/**
 * Sound System email layout, shared by every email the app sends.
 *
 * Table layout with inline styles only (Gmail and Outlook safe): no SVG, no
 * web fonts, no gradients, no rounded corners, no emoji. Black header with the
 * light logo, paper reading area, one yellow button, small black footer.
 * See design-system/brand-book.md for the colour and contrast rules.
 */

export const EMAIL_COLORS = {
  black: "#0F0D0B",
  yellow: "#F2C230",
  red: "#C8321F",
  paper: "#FFF7E6",
  muted: "#D8CCB4",
} as const;

const C = EMAIL_COLORS;

export const EMAIL_FONT_HEADLINE =
  "'Big Shoulders Display',Impact,'Arial Narrow Bold',sans-serif";
export const EMAIL_FONT_TEXT = "Archivo,Arial,Helvetica,sans-serif";

/** Absolute site URL for links and images inside email. */
export function emailSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.oneflamerecords.com"
  ).replace(/\/+$/, "");
}

/** Absolute URL for an image in public/brand/email/. */
export function emailAsset(file: string): string {
  return `${emailSiteUrl()}/brand/email/${file}`;
}

/** One paragraph of body text: black on paper. */
export function emailParagraph(html: string, opts: { last?: boolean } = {}): string {
  return `<p style="margin:0 0 ${opts.last ? "0" : "20px"};font-family:${EMAIL_FONT_TEXT};font-size:17px;line-height:1.6;color:${C.black};">${html}</p>`;
}

/** Smaller supporting line: still black on paper. */
export function emailSmallPrint(html: string): string {
  return `<p style="margin:28px 0 0;font-family:${EMAIL_FONT_TEXT};font-size:14px;line-height:1.5;color:${C.black};">${html}</p>`;
}

/** Text link on paper: red, underlined. */
export function emailLink(href: string, label: string): string {
  return `<a href="${href}" style="color:${C.red};text-decoration:underline;font-weight:600;">${label}</a>`;
}

/** The one yellow button per email. Bulletproof table button, black text. */
export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
    <tr>
      <td align="center" bgcolor="${C.yellow}" style="background-color:${C.yellow};border:2px solid ${C.black};">
        <a href="${href}" style="display:block;padding:15px 28px;font-family:${EMAIL_FONT_TEXT};font-size:15px;line-height:15px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;text-decoration:none;color:${C.black};">${label}</a>
      </td>
    </tr>
  </table>`;
}

interface EmailLayoutOptions {
  /** Document title (shown by some clients as the tab or preview title). */
  title?: string;
  /** Headline, set in sentence case; the style uppercases it. */
  heading?: string;
  /** Inner HTML for the reading area. */
  body: string;
  /** Inner HTML for the footer line. Defaults to the label name. */
  footerHtml?: string;
}

// The title can be an admin-typed newsletter subject, so escape it.
function escapeTitle(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function emailLayout(opts: EmailLayoutOptions): string {
  const { title, heading, body, footerHtml } = opts;

  const headingBlock = heading
    ? `<h1 style="margin:0;font-family:${EMAIL_FONT_HEADLINE};font-size:38px;line-height:40px;font-weight:900;text-transform:uppercase;letter-spacing:0.01em;color:${C.black};">${heading}</h1>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="72" style="margin:14px 0 24px;">
            <tr><td height="6" bgcolor="${C.red}" style="height:6px;line-height:6px;font-size:0;background-color:${C.red};">&nbsp;</td></tr>
          </table>`
    : "";

  const footer =
    footerHtml ??
    `One Flame Records &middot; Montego Bay, Jamaica`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escapeTitle(title ?? "One Flame Records")}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.black};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.black}" style="background-color:${C.black};">
    <tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td bgcolor="${C.black}" style="background-color:${C.black};padding:32px 32px 28px;">
            <img src="${emailAsset("horizontal-light.png")}" alt="One Flame Records" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0;outline:none;">
          </td>
        </tr>
        <tr><td height="4" bgcolor="${C.yellow}" style="height:4px;line-height:4px;font-size:0;background-color:${C.yellow};">&nbsp;</td></tr>
        <tr>
          <td bgcolor="${C.paper}" style="background-color:${C.paper};padding:40px 32px 44px;font-family:${EMAIL_FONT_TEXT};color:${C.black};">
          ${headingBlock}
          ${body}
          </td>
        </tr>
        <tr>
          <td bgcolor="${C.black}" style="background-color:${C.black};padding:24px 32px 32px;font-family:${EMAIL_FONT_TEXT};font-size:13px;line-height:1.5;color:${C.muted};">
            ${footer}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Adds inline styles to the plain HTML that markdown produces, so a newsletter
 * body matches the layout. Only styling is added; the content is unchanged.
 */
export function styleMarkdownHtml(html: string): string {
  const text = `font-family:${EMAIL_FONT_TEXT};color:${C.black};`;
  const head = `font-family:${EMAIL_FONT_HEADLINE};font-weight:900;text-transform:uppercase;line-height:1.05;color:${C.black};`;
  const add = (tag: string, style: string) => {
    html = html.replace(
      new RegExp(`<${tag}(\\s[^>]*)?>`, "g"),
      (_m, attrs: string | undefined) => {
        const a = attrs ?? "";
        return /\sstyle=/.test(a)
          ? `<${tag}${a}>`
          : `<${tag}${a} style="${style}">`;
      }
    );
  };
  add("p", `margin:0 0 20px;font-size:17px;line-height:1.6;${text}`);
  add("h1", `margin:0 0 16px;font-size:38px;${head}`);
  add("h2", `margin:28px 0 14px;font-size:30px;${head}`);
  add("h3", `margin:24px 0 12px;font-size:24px;${head}`);
  add("ul", `margin:0 0 20px;padding-left:24px;font-size:17px;line-height:1.6;${text}`);
  add("ol", `margin:0 0 20px;padding-left:24px;font-size:17px;line-height:1.6;${text}`);
  add("li", `margin:0 0 6px;${text}`);
  add("blockquote", `margin:0 0 20px;padding:0 0 0 16px;border-left:4px solid ${C.red};${text}`);
  add("a", `color:${C.red};text-decoration:underline;font-weight:600;`);
  add("hr", `border:0;border-top:2px solid ${C.black};margin:28px 0;`);
  return html;
}
