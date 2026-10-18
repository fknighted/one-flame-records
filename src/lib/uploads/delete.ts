import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
export async function deleteStoredAsset(id:string,artist:string):Promise<{error:string}|null> {
 const service=createServiceClient();
 const {error}=await service.rpc("delete_asset_record",{p_id:id,p_artist:artist});
 if(error) return {error:error.message};
 // The record and cleanup task were committed together. Storage outages never
 // strand a visible asset whose file has already disappeared.
 const {data:tasks}=await service.from("storage_cleanup_queue").select("id,bucket,path").limit(20);
 for(const task of tasks??[]){const result=await service.storage.from(task.bucket).remove([task.path]);if(!result.error)await service.from("storage_cleanup_queue").delete().eq("id",task.id);}
 return null;
}
