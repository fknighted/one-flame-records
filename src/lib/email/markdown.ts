import { Marked } from "marked";
import { escapeHtml } from "./escape";
const markdown = new Marked({
 renderer: { html: token => escapeHtml(token.text) },
 walkTokens(token) {
  if(token.type === "link" || token.type === "image") {
   if(!/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(token.href)) token.href="";
  }
 },
});
export async function renderSafeMarkdown(body:string) {return markdown.parse(body);}
