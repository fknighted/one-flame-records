import { escapeHtml } from './escape';
import { emailButton, emailLayout, emailParagraph, emailSmallPrint } from './layout';

export type EmailDraft = { subject: string; opening: string; body: string };
export const EMAIL_TEMPLATES = {
 'application-approved': { label:'Application approved / artist welcome', trigger:'When an administrator approves an artist or resends their invitation.', recipient:'Approved artist', mode:'Automatic after approval; manual resend', subject:"You're approved — set your One Flame portal password", opening:"You're in.", body:'Your application has been approved. Set your password below to access your artist portal.', button:'Set password & enter portal', expiry:true },
 'application-rejected': { label:'Application update', trigger:'When an administrator rejects a pending application.', recipient:'Applicant', mode:'Automatic after review', subject:'One Flame Records — Application Update', opening:'Thanks for applying.', body:"We’ve reviewed your application and, after careful consideration, we’re not moving forward at this time.\n\nThis isn’t a reflection of your talent. We receive many applications and can only take on a limited number of artists. Keep making music and apply again in the future.", button:'', expiry:false },
 'staff-invitation': { label:'Bar staff invitation resend', trigger:'When an administrator resends a bar account invitation. The first invitation is managed by the sign-in provider.', recipient:'Invited bar staff', mode:'Manual resend', subject:'Set up your One Flame bar account', opening:'Welcome to the bar team.', body:"You've been invited to the One Flame bar system. Set your password using the button below.", button:'Set your password', expiry:true },
 'subscription-confirmation': { label:'Newsletter subscription confirmation', trigger:'When someone requests a newsletter subscription.', recipient:'Person requesting the subscription', mode:'Automatic, after a public request', subject:'Confirm your One Flame newsletter subscription', opening:'Confirm your subscription', body:'Confirm below to receive One Flame Records news and releases.', button:'Confirm subscription', expiry:true },
 'unsubscribe-link': { label:'Secure unsubscribe link', trigger:'When someone requests a secure unsubscribe link.', recipient:'Person requesting the link', mode:'Automatic, after a public request', subject:'Your secure One Flame unsubscribe link', opening:'Manage your subscription', body:'Use the button below if you want to unsubscribe from One Flame Records newsletters.', button:'Unsubscribe', expiry:false },
 'welcome': { label:'Standalone artist welcome (inactive)', trigger:'No current sender uses this standalone template. Artist approval currently supplies the welcome and portal invitation.', recipient:'Artist, if a future approved workflow enables it', mode:'Inactive — editing does not send or enable it', subject:'Welcome to One Flame Records', opening:'Welcome to One Flame Records.', body:'Your artist portal lets you update your profile, upload demos and instrumentals, and watch saved videos.', button:'Go to your portal', expiry:false },
} as const;
export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;
export function isEmailTemplateKey(key:string):key is EmailTemplateKey { return Object.hasOwn(EMAIL_TEMPLATES,key); }
export function defaultEmailDraft(key:EmailTemplateKey):EmailDraft { const {subject,opening,body}=EMAIL_TEMPLATES[key];return {subject,opening,body}; }
export function validateEmailDraft(value:EmailDraft):EmailDraft {
 if(!value || typeof value.subject!=='string'||typeof value.opening!=='string'||typeof value.body!=='string')throw new Error('Enter a subject, opening and message.');
 const draft={subject:value.subject.trim(),opening:value.opening.trim(),body:value.body.trim()};
 if(!draft.subject||draft.subject.length>200||/[\r\n]/.test(draft.subject)||!draft.opening||draft.opening.length>200||!draft.body||draft.body.length>6000)throw new Error('Use a subject and opening up to 200 characters and a message up to 6,000 characters.');
 if(/(?:https?:|www\.|mailto:|javascript:|\{\{|\}\})/i.test(Object.values(draft).join('\n')))throw new Error('Use plain wording. Links and personal details are added securely by the app.');
 return draft;
}
export function renderEmailDraft(key:EmailTemplateKey,input:EmailDraft,details:{name?:string;url?:string}={}) {
 const draft=validateEmailDraft(input);const meta=EMAIL_TEMPLATES[key];
 if(meta.button && (!details.url || !/^https:\/\//.test(details.url)))throw new Error('A secure app-generated link is required.');
 const greeting=details.name?`For ${details.name}`:'';
 const required=meta.expiry?'This link expires in 24 hours. If you did not request this email, ignore it.':key==='unsubscribe-link'?'Only use this link if you requested it.':'';
 const body=[greeting?emailParagraph(escapeHtml(greeting)):'',...draft.body.split(/\n\s*\n/).map(p=>emailParagraph(escapeHtml(p).replace(/\n/g,'<br>'))),meta.button?emailButton(escapeHtml(details.url!),meta.button):'',required?emailSmallPrint(required):''].join('\n');
 return {subject:draft.subject,html:emailLayout({title:draft.subject,heading:draft.opening,body}),text:[draft.opening,greeting,draft.body,meta.button?`${meta.button}: ${details.url}`:'',required].filter(Boolean).join('\n\n')};
}
export const SAMPLE_EMAIL_DETAILS={name:'Sample Artist',url:'https://example.invalid/preview-only'};
