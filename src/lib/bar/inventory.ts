import { createServiceClient } from "@/lib/supabase/server";

/**
 * Shared add-only stock purchase logic, used by both the bartender
 * (`/bar/inventory`) and admin (`/admin/bar/inventory`) add-stock actions.
 *
 * Two modes:
 *  - "bottle": a spirit bought by the bottle and broken down into a sellable
 *    form. `containers` bottles at `containerCostJmd` each yield
 *    `containers × bottleYield` units, at a per-unit cost of
 *    `containerCostJmd ÷ bottleYield` (e.g. a $4,000 bottle ÷ 16 = $250/shot).
 *  - "unit": a plain item bought by the unit at `unitCostJmd` each.
 *
 * Always additive — quantities must be positive. Writes go through the
 * `add_pos_item_stock` RPC (atomic add + current-cost update) and record an
 * append-only row in `pos_stock_purchases`.
 */
export type StockPurchaseInput = {
  itemId: string;
  addedBy: string | null;
  note?: string | null;
} & (
  | { mode: "bottle"; containers: number; containerCostJmd: number; bottleYield: number }
  | { mode: "unit"; quantity: number; unitCostJmd: number }
);

export type StockPurchaseResult =
  | { ok: true; quantityAdded: number; unitCostJmd: number; newStock: number }
  | { ok: false; error: string };

export async function applyStockPurchase(input: StockPurchaseInput): Promise<StockPurchaseResult> {
  let quantityAdded: number;
  let unitCostJmd: number;
  let totalCostJmd: number;
  let containers: number | null = null;
  let containerCostJmd: number | null = null;

  if (input.mode === "bottle") {
    const { containers: c, containerCostJmd: cc, bottleYield } = input;
    if (!Number.isInteger(c) || c <= 0) return { ok: false, error: "Enter how many bottles (at least 1)." };
    if (!Number.isFinite(cc) || cc < 0) return { ok: false, error: "Enter the bottle cost." };
    if (!Number.isInteger(bottleYield) || bottleYield <= 0) return { ok: false, error: "This item has no bottle yield set." };
    quantityAdded = c * bottleYield;
    unitCostJmd = Math.round(cc / bottleYield);
    totalCostJmd = c * cc;
    containers = c;
    containerCostJmd = cc;
  } else {
    const { quantity, unitCostJmd: uc } = input;
    if (!Number.isInteger(quantity) || quantity <= 0) return { ok: false, error: "Enter how many units (at least 1)." };
    if (!Number.isFinite(uc) || uc < 0) return { ok: false, error: "Enter the unit cost." };
    quantityAdded = quantity;
    unitCostJmd = uc;
    totalCostJmd = quantity * uc;
  }

  const supabase = createServiceClient();

  const { data: newStock, error: rpcError } = await supabase.rpc("add_pos_item_stock", {
    p_item_id: input.itemId,
    p_qty: quantityAdded,
    p_unit_cost_jmd: unitCostJmd,
  });

  if (rpcError) return { ok: false, error: rpcError.message };

  // Ledger row is best-effort — the stock is already added; a failed insert
  // should not roll back the addition, but we surface nothing extra to the user.
  await supabase.from("pos_stock_purchases").insert({
    pos_item_id: input.itemId,
    quantity_added: quantityAdded,
    unit_cost_jmd: unitCostJmd,
    total_cost_jmd: totalCostJmd,
    containers,
    container_cost_jmd: containerCostJmd,
    added_by: input.addedBy,
    note: input.note ?? null,
  });

  return { ok: true, quantityAdded, unitCostJmd, newStock: newStock ?? 0 };
}
