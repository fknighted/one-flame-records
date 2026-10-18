"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function openTab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const name       = (formData.get("name") as string)?.trim();
  const notes      = (formData.get("notes") as string)?.trim() || null;
  const regularId  = (formData.get("regular_id") as string)?.trim() || null;

  if (!name) return { error: "Customer name is required." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if(!user)return {error:"Not authenticated."};
  const requestId=String(formData.get("request_id")??"");
  if(!requestId)return {error:"Refresh this page before opening a tab."};
  const {data:tabId,error}=await createServiceClient().rpc("bar_open_tab",{p_request_id:requestId,p_actor:user.id,p_name:name,p_notes:notes,p_regular:regularId});
  if(error||!tabId)return {error:error?.message??"Could not open tab."};
  redirect(`/bar/tabs/${tabId}`);
}
