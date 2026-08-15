"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin, currentUserId } from "@/lib/auth";
import { applyStockPurchase } from "@/lib/bar/inventory";

export type ActionState = { error: string } | { ok: string } | null;

/**
 * Parse a whole-dollar money input. Money is whole JMD dollars (docs/decisions.md),
 * so a fractional amount is REJECTED rather than rounded — silently rounding is how
 * sub-dollar values got into the data in the first place. "250" and "250.00" are
 * both fine; "250.50" is not.
 */
function parseJmd(value: string | null): number | null {
  if (!value) return null;
  const dollars = parseFloat(value);
  if (isNaN(dollars) || dollars < 0 || !Number.isInteger(dollars)) return null;
  return dollars;
}

/** Admin-only absolute overwrite of stock — this is how admin lowers/removes stock. */
export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id  = formData.get("id") as string;
  const raw = formData.get("qty") as string;
  const qty = parseInt(raw, 10);
  if (!id || isNaN(qty) || qty < 0) return;
  const supabase = createServiceClient();
  await supabase
    .from("pos_items")
    .update({ stock_quantity: qty, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/bar/inventory");
}

/** Admin add-only stock purchase (same additive flow as the bartender path). */
export async function addStock(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const itemId = formData.get("item_id") as string;
  if (!itemId) return { error: "Invalid request." };

  const supabase = createServiceClient();
  const { data: item } = await supabase
    .from("pos_items")
    .select("id, name, bottle_group, bottle_yield")
    .eq("id", itemId)
    .single();
  if (!item) return { error: "Item not found." };

  const addedBy = await currentUserId();
  const isBottle = !!item.bottle_yield;
  const yieldOverride = parseInt(formData.get("bottle_yield") as string, 10);

  const result = isBottle
    ? await applyStockPurchase({
        itemId,
        addedBy,
        mode: "bottle",
        containers: parseInt(formData.get("containers") as string, 10),
        containerCostJmd: parseJmd(formData.get("container_cost") as string) ?? NaN,
        bottleYield: Number.isInteger(yieldOverride) && yieldOverride > 0 ? yieldOverride : item.bottle_yield!,
      })
    : await applyStockPurchase({
        itemId,
        addedBy,
        mode: "unit",
        quantity: parseInt(formData.get("quantity") as string, 10),
        unitCostJmd: parseJmd(formData.get("unit_cost") as string) ?? NaN,
      });

  if (!result.ok) return { error: result.error };

  revalidatePath("/admin/bar/inventory");
  return { ok: `Added ${result.quantityAdded} ${item.name} — stock now ${result.newStock}.` };
}
