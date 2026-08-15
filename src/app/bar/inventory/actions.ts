"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff, currentUserId } from "@/lib/auth";
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

/**
 * Bartender add-only stock. Add-only is enforced here: quantities/containers
 * must be positive; there is no set/remove path on the staff side. The bottle
 * yield is read from the item in the DB (never trusted from the client).
 */
export async function addStock(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

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
  // Yield (units per bottle) is editable at add-time — 750ml vs 1L pour a
  // different number of shots. Fall back to the item's stored default.
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

  revalidatePath("/bar/inventory");
  return { ok: `Added ${result.quantityAdded} ${item.name} — stock now ${result.newStock}.` };
}
