"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff, currentUserId } from "@/lib/auth";
import type { Json } from "@/types/supabase";
export type ActionState = { error: string } | null;

async function apply(operation: string, formData: FormData): Promise<ActionState> {
  await requireBarStaff();
  const actor = await currentUserId();
  const tabId = String(formData.get("tab_id") ?? "");
  if (!actor || !tabId) return { error: "Invalid request." };
  const requestId = String(formData.get("request_id") ?? "");
  if (!/^[a-f0-9-]{36}$/i.test(requestId)) return { error: "Refresh the page before trying again." };
  const payload: Record<string, Json> = {};
  for (const key of ["item_id", "tab_item_id", "reason", "name", "payment_method"]) {
    const value = formData.get(key); if (typeof value === "string") payload[key] = value;
  }
  if (operation === "custom") {
    const price = Number(formData.get("price"));
    if (!Number.isSafeInteger(price) || price <= 0 || price > 2147483647) return { error: "Enter a positive whole-dollar amount." };
    payload.price = price;
  }
  if (operation === "close") {
    const tip = Number(formData.get("tip_jmd") || 0);
    if (!Number.isSafeInteger(tip) || tip < 0 || tip > 2147483647) return { error: "Enter a whole-dollar tip." };
    payload.tip_jmd = tip;
  }
  const { error } = await createServiceClient().rpc("bar_apply_operation", { p_request_id: requestId, p_actor: actor, p_tab_id: tabId, p_operation: operation, p_payload: payload });
  if (error) return { error: error.message };
  revalidatePath(`/bar/tabs/${tabId}`); revalidatePath("/bar"); revalidatePath("/admin/bar", "layout");
  return null;
}
export async function addItemToTab(_prev: ActionState, data: FormData) { return apply("add", data); }
export async function incrementTabItem(_prev: ActionState, data: FormData) { return apply("increment", data); }
export async function decrementTabItem(_prev: ActionState, data: FormData) { return apply("decrement", data); }
export async function removeTabItem(_prev: ActionState, data: FormData) { return apply("remove", data); }
export async function addCustomItem(_prev: ActionState, data: FormData) { return apply("custom", data); }
export async function markTabAway(_prev: ActionState, data: FormData) { return apply("away", data); }
export async function reopenTab(_prev: ActionState, data: FormData) { return apply("reopen", data); }
export async function closeTab(_prev: ActionState, data: FormData): Promise<ActionState> { const result = await apply("close", data); if (result) return result; redirect("/bar"); }
export async function voidTab(_prev: ActionState, data: FormData): Promise<ActionState> { const result = await apply("void", data); if (result) return result; redirect("/bar"); }

export async function saveTabAsRegular(tabId: string): Promise<ActionState> {
  await requireBarStaff();

  const supabase = createServiceClient();

  const {error}=await supabase.rpc("bar_save_regular",{p_tab:tabId});
  if(error)return {error:error.message};
  revalidatePath(`/bar/tabs/${tabId}`);return null;
}
