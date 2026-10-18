import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/server";
export const storageCleanup = inngest.createFunction(
 {id:"storage-cleanup",triggers:[{cron:"0 * * * *"}],retries:2},
 async({step})=>step.run("remove-queued-files",async()=>{
  const service=createServiceClient();const {data,error}=await service.from("storage_cleanup_queue").select("id,bucket,path").order("created_at").limit(100);
  if(error)throw error;
  let removed=0;
  for(const task of data??[]){
   const referenced=await service.from("assets").select("id",{count:"exact",head:true}).eq("storage_path",task.path);
   if(referenced.error)throw referenced.error;
   if(referenced.count)continue;
   const result=await service.storage.from(task.bucket).remove([task.path]);
   if(result.error)throw result.error;
   const saved=await service.from("storage_cleanup_queue").delete().eq("id",task.id);if(saved.error)throw saved.error;
   removed++;
  }
  return {removed};
 })
);
