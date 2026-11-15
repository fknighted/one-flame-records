import { buttonClasses } from "@/lib/sound-system";
import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyNewsletterToken } from "@/lib/email/newsletter-token";
export const metadata={title:"Confirm subscription",robots:{index:false,follow:false}};
async function confirm(data:FormData){
 "use server";
 const token=String(data.get("token")??"");const email=verifyNewsletterToken(token,"confirm");
 if(!email)redirect("/subscribe/confirm?result=invalid");
 const {data:ok,error}=await createServiceClient().rpc("confirm_newsletter",{p_email:email,p_hash:createHash("sha256").update(token).digest("hex")});
 redirect(`/subscribe/confirm?result=${!error&&ok?"confirmed":"invalid"}`);
}
export default async function ConfirmSubscription({searchParams}:{searchParams:Promise<{token?:string;result?:string}>}){
 const {token,result}=await searchParams;
 return <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-[88px] type-body"><h1 className="type-headline mb-6 [overflow-wrap:anywhere]">{result==="confirmed"?"You’re subscribed.":"Confirm your subscription"}</h1>
 {result==="invalid"?<p>This confirmation has expired or was already used. Please subscribe again for a fresh link.</p>:result==="confirmed"?<p>New releases and label news will reach your inbox.</p>:token&&verifyNewsletterToken(token,"confirm")?<form action={confirm}><input type="hidden" name="token" value={token}/><button className={buttonClasses("primary", "black")}>Confirm subscription</button></form>:<p>Use the confirmation link from your email.</p>}</section>;
}
