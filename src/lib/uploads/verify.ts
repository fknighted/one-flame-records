import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
export async function verifyUpload(id: string, owner: string, artist: string, purpose: string) {
 const service=createServiceClient();
 const { data: upload,error }=await service.from("upload_reservations").select("*").eq("id",id).eq("owner_id",owner).eq("artist_id",artist).eq("purpose",purpose).single();
 if(error || !upload || Date.parse(upload.expires_at)<Date.now()) throw new Error("Upload expired or belongs to another account. Please select the file again.");
 const {data:file,error:downloadError}=await service.storage.from(upload.bucket).download(upload.path);
 if(downloadError || !file || file.size!==upload.size_bytes) throw new Error("The file has not finished uploading. Please retry.");
 const buffer=new Uint8Array(await file.arrayBuffer());
 const text=(start:number,end:number)=>String.fromCharCode(...buffer.slice(start,end));
 const mime=upload.mime_type;
 const valid=mime==="image/jpeg" ? buffer[0]===255&&buffer[1]===216&&buffer[2]===255
 : mime==="image/png" ? buffer[0]===137&&text(1,4)==="PNG"
 : mime==="image/webp" ? text(0,4)==="RIFF"&&text(8,12)==="WEBP"
 : mime==="audio/wav"||mime==="audio/x-wav" ? text(0,4)==="RIFF"&&text(8,12)==="WAVE"
 : mime==="audio/mpeg" ? text(0,3)==="ID3" || buffer[0]===255&&(buffer[1]&224)===224
 : mime==="video/mp4"||mime==="video/quicktime" ? ["ftyp","moov","mdat","wide"].includes(text(4,8)) : false;
 if(!valid) throw new Error("The file contents do not match the selected file type.");
 return {upload,buffer};
}
