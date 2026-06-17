"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function addItemToTab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabId  = formData.get("tab_id") as string;
  const itemId = formData.get("item_id") as string;

  if (!tabId || !itemId) return { error: "Invalid request." };

  const supabase = createServiceClient();

  const [{ data: tab }, { data: item }] = await Promise.all([
    supabase.from("pos_tabs").select("id, total_cents, status").eq("id", tabId).single(),
    supabase.from("pos_items").select("id, name, price_cents, is_active").eq("id", itemId).single(),
  ]);

  if (!tab)             return { error: "Tab not found." };
  if (tab.status !== "open") return { error: "This tab is already closed." };
  if (!item?.is_active) return { error: "Item is no longer available." };

  const { error: insertError } = await supabase.from("pos_tab_items").insert({
    tab_id:     tabId,
    pos_item_id: itemId,
    name:       item.name,
    price_cents: item.price_cents,
    quantity:   1,
  });
  if (insertError) return { error: `Failed to add item: ${insertError.message}` };

  const { error: updateError } = await supabase
    .from("pos_tabs")
    .update({ total_cents: tab.total_cents + item.price_cents })
    .eq("id", tabId);
  if (updateError) return { error: `Failed to update total: ${updateError.message}` };

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function removeTabItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabItemId = formData.get("tab_item_id") as string;
  const tabId     = formData.get("tab_id") as string;

  if (!tabItemId || !tabId) return { error: "Invalid request." };

  const supabase = createServiceClient();

  const { data: tabItem } = await supabase
    .from("pos_tab_items")
    .select("price_cents")
    .eq("id", tabItemId)
    .single();

  if (!tabItem) return { error: "Item not found." };

  const { data: tab } = await supabase
    .from("pos_tabs")
    .select("total_cents")
    .eq("id", tabId)
    .single();

  const { error: deleteError } = await supabase
    .from("pos_tab_items")
    .delete()
    .eq("id", tabItemId);

  if (deleteError) return { error: `Failed to remove item: ${deleteError.message}` };

  if (tab) {
    await supabase
      .from("pos_tabs")
      .update({ total_cents: Math.max(0, tab.total_cents - tabItem.price_cents) })
      .eq("id", tabId);
  }

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function closeTab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabId        = formData.get("tab_id") as string;
  const paymentMethod = formData.get("payment_method") as string;

  if (!tabId) return { error: "Invalid request." };
  if (!["cash", "card", "comp"].includes(paymentMethod)) return { error: "Select a payment method." };

  const supabase   = createServiceClient();
  const session    = await createClient();
  const { data: { user } } = await session.auth.getUser();

  const { error } = await supabase.from("pos_tabs").update({
    status:         "closed",
    payment_method: paymentMethod,
    closed_by:      user?.id ?? null,
    closed_at:      new Date().toISOString(),
  }).eq("id", tabId).eq("status", "open");

  if (error) return { error: `Failed to close tab: ${error.message}` };

  redirect("/bar");
}

export async function voidTab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabId = formData.get("tab_id") as string;
  if (!tabId) return { error: "Invalid request." };

  const supabase = createServiceClient();
  const session  = await createClient();
  const { data: { user } } = await session.auth.getUser();

  const { error } = await supabase.from("pos_tabs").update({
    status:    "voided",
    closed_by: user?.id ?? null,
    closed_at: new Date().toISOString(),
  }).eq("id", tabId).eq("status", "open");

  if (error) return { error: `Failed to void tab: ${error.message}` };

  redirect("/bar");
}
