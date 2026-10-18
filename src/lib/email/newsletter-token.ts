import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
function key(){const value=process.env.NEWSLETTER_TOKEN_SECRET??process.env.SUPABASE_SERVICE_ROLE_KEY;if(!value)throw new Error("Newsletter signing is not configured.");return value;}
export function newsletterToken(email:string,scope:"confirm"|"unsubscribe",nonce=""){
 const payload=Buffer.from(JSON.stringify({email,scope,nonce,expires:scope==="confirm"?Date.now()+86400000:null})).toString("base64url");
 return `${payload}.${createHmac("sha256",key()).update(payload).digest("base64url")}`;
}
export function verifyNewsletterToken(token:string,scope:"confirm"|"unsubscribe"):string|null{
 try{const [payload,signature,...extra]=token.split(".");if(extra.length || !payload || !signature)return null;
 const expected=createHmac("sha256",key()).update(payload).digest();const supplied=Buffer.from(signature,"base64url");
 if(expected.length!==supplied.length || !timingSafeEqual(expected,supplied))return null;
 const data=JSON.parse(Buffer.from(payload,"base64url").toString());
 return data.scope===scope && typeof data.email==="string" && (scope!=="confirm" || (typeof data.expires==="number"&&data.expires>Date.now())) ? data.email : null;
 }catch{return null;}
}
