"use client";
import { useCallback, useRef } from "react";
import { prepareUpload } from "./actions";
export function useUploadAction<S extends { error: string } | { success: true } | null>(action: (previous:S,data:FormData)=>Promise<S>, purpose:"asset"|"profile_photo",artistId?:string) {
 const saved=useRef<{ fingerprint:string; id:string }|null>(null);
 return useCallback(async(previous:S,data:FormData):Promise<S>=>{
  const file=data.get(purpose === "asset" ? "file" : "photo");
  if(file instanceof File && file.size>0){
   const fingerprint=`${purpose}:${artistId??"self"}:${String(data.get("kind")??"profile_photo")}:${file.name}:${file.size}:${file.lastModified}`;
   try {
    if(saved.current?.fingerprint!==fingerprint){
     const prepared=await prepareUpload({kind:purpose==="asset"?String(data.get("kind")):"profile_photo",purpose,mime:file.type,size:file.size,artistId});
     const response=await fetch(prepared.signedUrl,{method:"PUT",headers:{"Content-Type":file.type,"x-upsert":"false"},body:file});
     if(!response.ok) throw new Error("File upload failed. Please try again.");
     saved.current={fingerprint,id:prepared.id};
    }
    data.set("upload_id",saved.current.id);
    data.delete(purpose==="asset"?"file":"photo");
   }catch(error){return {error:error instanceof Error?error.message:"Upload failed."} as S;}
  }
  const result=await action(previous,data);
  if(!result || !("error" in result)) saved.current=null;
  return result;
 },[action,purpose,artistId]);
}
