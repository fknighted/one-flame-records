import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
export function newsletterReviewToken(actor:string,subject:string,body:string){
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!secret)throw new Error('Review signing is not configured.');
 return createHmac('sha256',secret).update(JSON.stringify(['newsletter-review-v1',actor,subject,body])).digest('hex');
}
export function verifyNewsletterReview(actor:string,subject:string,body:string,token:string){
 if(!/^[a-f0-9]{64}$/.test(token))return false;return timingSafeEqual(Buffer.from(token,'hex'),Buffer.from(newsletterReviewToken(actor,subject,body),'hex'));
}
