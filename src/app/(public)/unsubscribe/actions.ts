"use server";
import {createServiceClient} from "@/lib/supabase/server";
import {newsletterToken,verifyNewsletterToken} from "@/lib/email/newsletter-token";
import {allowPublicForm} from "@/lib/form-limit";
import {sendEmail} from "@/lib/email/send";
import {renderManagedEmail} from "@/lib/email/managed";
export async function unsubscribeEmail(email:string,token:string):Promise<{error?:string}>{
 const verified=verifyNewsletterToken(token,"unsubscribe");
 if(!verified || verified!==email.toLowerCase().trim())return {error:"Use a secure unsubscribe link from your email."};
 const {error}=await createServiceClient().from("fan_subscribers").update({status:"unsubscribed"}).eq("email",verified);
 return error?{error:"Could not unsubscribe. Please try again."}:{};
}
export async function requestUnsubscribe(email:string):Promise<{error?:string}>{
 email=email.trim().toLowerCase();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return {error:"Enter a valid email."};
 if(!await allowPublicForm("unsubscribe",email,3))return {error:"Please wait before requesting another link."};
 const url=`${process.env.NEXT_PUBLIC_SITE_URL??"https://www.oneflamerecords.com"}/unsubscribe?token=${encodeURIComponent(newsletterToken(email,"unsubscribe"))}`;
 return sendEmail({to:email,...await renderManagedEmail("unsubscribe-link",{url})});
}
