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
    supabase.from("pos_tabs").select("id, status").eq("id", tabId).single(),
    supabase.from("pos_items").select("id, name, price_cents, is_active, stock_quantity").eq("id", itemId).single(),
  ]);

  if (!tab)                  return { error: "Tab not found." };
  if (tab.status !== "open") return { error: "This tab is already closed." };
  if (!item?.is_active)      return { error: "Item is no longer available." };
  if (item.stock_quantity !== null && item.stock_quantity <= 0) return { error: "Item is out of stock." };

  // Capture the inserted row ID so we can undo it if the stock decrement races to 0
  const { data: inserted, error: insertError } = await supabase
    .from("pos_tab_items")
    .insert({
      tab_id:      tabId,
      pos_item_id: itemId,
      name:        item.name,
      price_cents: item.price_cents,
      quantity:    1,
    })
    .select("id")
    .single();
  if (insertError) return { error: `Failed to add item: ${insertError.message}` };

  // Atomic stock decrement — if it returns false, a concurrent request took the last unit
  if (item.stock_quantity !== null) {
    const { data: ok, error: stockErr } = await supabase.rpc(
      "decrement_pos_item_stock",
      { p_item_id: itemId }
    );
    if (stockErr || !ok) {
      await supabase.from("pos_tab_items").delete().eq("id", inserted.id);
      return { error: "Item just went out of stock." };
    }
  }

  // Atomic total increment (SQL arithmetic — avoids read-modify-write race)
  const { error: updateError } = await supabase.rpc(
    "increment_tab_total",
    { p_tab_id: tabId, p_amount: item.price_cents }
  );
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

  // Single query: verify the item belongs to tabId AND the tab is still open.
  // Prevents IDOR where a caller supplies a tabItemId from a different tab.
  const { data: tabItem } = await supabase
    .from("pos_tab_items")
    .select("price_cents, tab_id, pos_tabs!inner(status)")
    .eq("id", tabItemId)
    .eq("tab_id", tabId)
    .single();

  if (!tabItem) return { error: "Item not found." };

  const tabData = Array.isArray(tabItem.pos_tabs) ? tabItem.pos_tabs[0] : tabItem.pos_tabs;
  if (!tabData || tabData.status !== "open") return { error: "Tab is already closed." };

  const { error: deleteError } = await supabase
    .from("pos_tab_items")
    .delete()
    .eq("id", tabItemId);

  if (deleteError) return { error: `Failed to remove item: ${deleteError.message}` };

  // Atomic total decrement, floored at 0
  const { error: totalError } = await supabase.rpc(
    "decrement_tab_total",
    { p_tab_id: tabId, p_amount: tabItem.price_cents }
  );
  if (totalError) return { error: `Item removed but total not updated: ${totalError.message}` };

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function incrementTabItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabItemId = formData.get("tab_item_id") as string;
  const tabId     = formData.get("tab_id") as string;
  if (!tabItemId || !tabId) return { error: "Invalid request." };

  const supabase = createServiceClient();

  // Verify the tab is still open and item belongs to this tab
  const { data: tabItem } = await supabase
    .from("pos_tab_items")
    .select("price_cents, tab_id, pos_tabs!inner(status)")
    .eq("id", tabItemId)
    .eq("tab_id", tabId)
    .single();

  if (!tabItem) return { error: "Item not found." };
  const tabData = Array.isArray(tabItem.pos_tabs) ? tabItem.pos_tabs[0] : tabItem.pos_tabs;
  if (!tabData || tabData.status !== "open") return { error: "Tab is already closed." };

  // Increment quantity in place
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: qtyError } = await (supabase.rpc as any)("increment_tab_item_quantity", { p_tab_item_id: tabItemId });
  if (qtyError) return { error: `Failed to update quantity: ${qtyError.message}` };

  // Increment tab total by the item price
  const { error: totalError } = await supabase.rpc("increment_tab_total", { p_tab_id: tabId, p_amount: tabItem.price_cents });
  if (totalError) return { error: `Quantity updated but total not synced: ${totalError.message}` };

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function decrementTabItem(
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
    .select("quantity, price_cents, tab_id, pos_tabs!inner(status)")
    .eq("id", tabItemId)
    .eq("tab_id", tabId)
    .single();

  if (!tabItem) return { error: "Item not found." };
  const tabData = Array.isArray(tabItem.pos_tabs) ? tabItem.pos_tabs[0] : tabItem.pos_tabs;
  if (!tabData || tabData.status !== "open") return { error: "Tab is already closed." };

  if (tabItem.quantity <= 1) {
    // Remove the item entirely (same as removeTabItem)
    await supabase.from("pos_tab_items").delete().eq("id", tabItemId);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: qtyError } = await (supabase.rpc as any)("decrement_tab_item_quantity", { p_tab_item_id: tabItemId });
    if (qtyError) return { error: `Failed to update quantity: ${qtyError.message}` };
  }

  // Decrement tab total, floored at 0
  const { error: totalError } = await supabase.rpc("decrement_tab_total", { p_tab_id: tabId, p_amount: tabItem.price_cents });
  if (totalError) return { error: `Quantity updated but total not synced: ${totalError.message}` };

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function addCustomItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabId      = formData.get("tab_id") as string;
  const rawName    = (formData.get("name") as string)?.trim();
  const rawPrice   = formData.get("price") as string;

  if (!tabId) return { error: "Invalid request." };

  const name = rawName || "Other";
  const dollars = parseFloat(rawPrice);
  if (isNaN(dollars) || dollars <= 0) return { error: "Enter a valid amount." };
  const price_cents = Math.round(dollars * 100);

  const supabase = createServiceClient();

  const { data: tab } = await supabase
    .from("pos_tabs")
    .select("id, status")
    .eq("id", tabId)
    .single();

  if (!tab)                  return { error: "Tab not found." };
  if (tab.status !== "open") return { error: "This tab is already closed." };

  const { error: insertError } = await supabase
    .from("pos_tab_items")
    .insert({ tab_id: tabId, name, price_cents, quantity: 1 });

  if (insertError) return { error: `Failed to add item: ${insertError.message}` };

  const { error: totalError } = await supabase.rpc(
    "increment_tab_total",
    { p_tab_id: tabId, p_amount: price_cents }
  );
  if (totalError) return { error: `Item added but total not updated: ${totalError.message}` };

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function saveTabAsRegular(tabId: string): Promise<ActionState> {
  await requireBarStaff();

  const supabase = createServiceClient();

  const { data: tab } = await supabase
    .from("pos_tabs")
    .select("id, name, regular_id")
    .eq("id", tabId)
    .single();

  if (!tab)           return { error: "Tab not found." };
  if (tab.regular_id) return { error: "Tab is already linked to a regular." };

  const { data: regular, error: createError } = await supabase
    .from("bar_regulars")
    .insert({ name: tab.name })
    .select("id")
    .single();

  if (createError || !regular) return { error: `Failed to create regular: ${createError?.message}` };

  const { error: linkError } = await supabase
    .from("pos_tabs")
    .update({ regular_id: regular.id })
    .eq("id", tabId);

  if (linkError) {
    // Roll back the orphaned regular so it doesn't pollute the autocomplete list
    await supabase.from("bar_regulars").delete().eq("id", regular.id);
    return { error: `Failed to link tab: ${linkError.message}` };
  }

  revalidatePath(`/bar/tabs/${tabId}`);
  return null;
}

export async function closeTab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const tabId         = formData.get("tab_id") as string;
  const paymentMethod = formData.get("payment_method") as string;
  const tipRaw        = formData.get("tip_cents") as string | null;
  const tipCents      = tipRaw ? Math.max(0, Math.round(Number(tipRaw))) : 0;

  if (!tabId) return { error: "Invalid request." };
  if (!["cash", "comp"].includes(paymentMethod)) return { error: "Select a payment method." };

  const supabase   = createServiceClient();
  const session    = await createClient();
  const { data: { user } } = await session.auth.getUser();

  const { error } = await supabase.from("pos_tabs").update({
    status:         "closed",
    payment_method: paymentMethod,
    closed_by:      user?.id ?? null,
    closed_at:      new Date().toISOString(),
    tip_cents:      tipCents,
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
