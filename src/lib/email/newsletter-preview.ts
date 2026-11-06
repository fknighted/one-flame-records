import { emailLayout, styleMarkdownHtml } from './layout';
import { renderSafeMarkdown } from './markdown';
export async function renderNewsletterPreview(subject:string,body:string){
 if(!subject.trim()||subject.length>200||/[\r\n]/.test(subject)||!body.trim()||body.length>50000)throw new Error('Enter a subject up to 200 characters and a message up to 50,000 characters.');
 return emailLayout({title:subject,body:styleMarkdownHtml(await renderSafeMarkdown(body)),footerHtml:'You subscribed to One Flame Records. <a href="https://example.invalid/preview-only" style="color:#F2C230;">Unsubscribe</a>'});
}
