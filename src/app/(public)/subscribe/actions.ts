"use server";
import { randomBytes, createHash } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { allowPublicForm } from "@/lib/form-limit";
import { sendEmail } from "@/lib/email/send";
import { emailLayout, emailButton } from "@/lib/email/layout";
import { newsletterToken } from "@/lib/email/newsletter-token";
export async function subscribeEmail(raw:string):Promise<{error?:string}>{
 const email=typeof raw==="string"?raw.trim().toLowerCase():"";
 if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {error:"Please enter a valid email address."};
 if(!await allowPublicForm("subscribe",email,3))return {error:"Please wait before requesting another confirmation."};
 const token=newsletterToken(email,"confirm",randomBytes(24).toString("hex"));
 const {error}=await createServiceClient().from("newsletter_confirmations").upsert({email,token_hash:createHash("sha256").update(token).digest("hex"),expires_at:new Date(Date.now()+86400000).toISOString()});
 if(error)return {error:"Could not prepare confirmation. Please try again."};
 const url=`${process.env.NEXT_PUBLIC_SITE_URL??"https://www.oneflamerecords.com"}/subscribe/confirm?token=${encodeURIComponent(token)}`;
 return sendEmail({to:email,subject:"Confirm your One Flame newsletter subscription",text:`Confirm your subscription: ${url}\nThis link expires in 24 hours. If you did not request it, ignore this email.`,html:emailLayout({heading:"Confirm your subscription",body:emailButton(url,"Confirm subscription")+"<p>If you did not request this, ignore this email. The link expires in 24 hours.</p>"})});
}
