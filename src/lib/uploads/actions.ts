"use server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { allowPublicForm } from "@/lib/form-limit";
import { requireAdmin } from "@/lib/auth";
const TYPES: Record<string, string[]> = {
 instrumental: ["audio/mpeg", "audio/wav", "audio/x-wav"], demo: ["audio/mpeg", "audio/wav", "audio/x-wav"],
 reference_video: ["video/mp4", "video/quicktime"], reference_image: ["image/jpeg", "image/png", "image/webp"],
 profile_photo: ["image/jpeg", "image/png", "image/webp"],
};
export async function prepareUpload(input: { kind: string; purpose: "asset" | "profile_photo"; mime: string; size: number; artistId?: string }) {
 const session = await createClient(); const { data: { user } } = await session.auth.getUser();
 if (!user) throw new Error("Sign in before uploading.");
 const { data: profile } = await session.from("profiles").select("artist_id, role").eq("id",user.id).single();
 let artistId = profile?.artist_id;
 if (input.artistId) { await requireAdmin(); artistId = input.artistId; }
 if (!await allowPublicForm("media-upload",user.id,30)) throw new Error("Please wait before preparing another upload.");
 if (!artistId) throw new Error("No linked artist profile.");
 if (input.purpose === "profile_photo" && input.kind !== "profile_photo") throw new Error("Invalid photo upload.");
 const max = input.purpose === "profile_photo" ? 5*1024*1024 : 10*1024*1024;
 if (!TYPES[input.kind]?.includes(input.mime) || !Number.isInteger(input.size) || input.size<=0 || input.size>max) throw new Error(`Choose a supported file under ${max/1024/1024} MB.`);
 const ext: Record<string,string> = {"image/jpeg":"jpg","image/png":"png","image/webp":"webp","audio/mpeg":"mp3","audio/wav":"wav","audio/x-wav":"wav","video/mp4":"mp4","video/quicktime":"mov"};
 const bucket = input.purpose === "profile_photo" ? "public-media" : "private-assets";
 const path = `${input.purpose === "profile_photo" ? "photos/" : ""}${artistId}/${crypto.randomUUID()}.${ext[input.mime]}`;
 const service=createServiceClient();
 const { data: reservation, error } = await service.from("upload_reservations").insert({ owner_id:user.id, artist_id:artistId,purpose:input.purpose,kind:input.kind,bucket,path,mime_type:input.mime,size_bytes:input.size }).select("id").single();
 if (error || !reservation) throw new Error("Could not prepare upload. Please try again.");
 const signed=await service.storage.from(bucket).createSignedUploadUrl(path);
 if(signed.error || !signed.data) throw new Error("Could not prepare file storage.");
 return { id:reservation.id,signedUrl:signed.data.signedUrl };
}
