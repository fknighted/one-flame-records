import "server-only";
import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
export async function allowPublicForm(kind:string,email:string,limit=5):Promise<boolean>{
 const h=await headers(); const ip=h.get("x-vercel-forwarded-for")??h.get("x-real-ip")??h.get("x-forwarded-for")?.split(",")[0]??"unknown";
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret) return false;
 for(const value of [`ip:${ip}`,`email:${email.toLowerCase().trim()}`]){
  const key=createHmac("sha256",secret).update(`${kind}:${value}`).digest("hex");
  const {data,error}=await createServiceClient().rpc("consume_form_limit",{p_key:key,p_limit:limit,p_window_seconds:3600});
  if(error || !data) return false;
 }
 return true;
}
