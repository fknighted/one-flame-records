import { createServiceClient } from "@/lib/supabase/server";

/**
 * Shared add-only stock purchase logic, used by both the bartender
 * (`/bar/inventory`) and admin (`/admin/bar/inventory`) add-stock actions.
 *
 * Two modes:
 *  - "bottle": a spirit bought by the bottle and broken down into a sellable
 *    form. `containers` bottles at `containerCostCents` each yield
 *    `containers × bottleYield` units, at a per-unit cost of
 *    `containerCostCents ÷ bottleYield` (e.g. a $4,000 bottle ÷ 16 = $250/shot).
 *  - "unit": a plain item bought by the unit at `unitCostCents` each.
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
  | { mode: "bottle"; containers: number; containerCostCents: number; bottleYield: number }
  | { mode: "unit"; quantity: number; unitCostCents: number }
);

export type StockPurchaseResult =
  | { ok: true; quantityAdded: number; unitCostCents: number; newStock: number }
  | { ok: false; error: string };

export async function applyStockPurchase(input: StockPurchaseInput): Promise<StockPurchaseResult> {
  let quantityAdded: number;
  let unitCostCents: number;
  let totalCostCents: number;
  let containers: number | null = null;
  let containerCostCents: number | null = null;

  if (input.mode === "bottle") {
    const { containers: c, containerCostCents: cc, bottleYield } = input;
    if (!Number.isInteger(c) || c <= 0) return { ok: false, error: "Enter how many bottles (at least 1)." };
    if (!Number.isFinite(cc) || cc < 0) return { ok: false, error: "Enter the bottle cost." };
    if (!Number.isInteger(bottleYield) || bottleYield <= 0) return { ok: false, error: "This item has no bottle yield set." };
    quantityAdded = c * bottleYield;
    unitCostCents = Math.round(cc / bottleYield);
    totalCostCents = c * cc;
    containers = c;
    containerCostCents = cc;
  } else {
    const { quantity, unitCostCents: uc } = input;
    if (!Number.isInteger(quantity) || quantity <= 0) return { ok: false, error: "Enter how many units (at least 1)." };
    if (!Number.isFinite(uc) || uc < 0) return { ok: false, error: "Enter the unit cost." };
    quantityAdded = quantity;
    unitCostCents = uc;
    totalCostCents = quantity * uc;
  }

  const supabase = createServiceClient();

  const { data: newStock, error: rpcError } = await supabase.rpc("add_pos_item_stock", {
    p_item_id: input.itemId,
    p_qty: quantityAdded,
    p_unit_cost_cents: unitCostCents,
  });

  if (rpcError) return { ok: false, error: rpcError.message };

  // Ledger row is best-effort — the stock is already added; a failed insert
  // should not roll back the addition, but we surface nothing extra to the user.
  await supabase.from("pos_stock_purchases").insert({
    pos_item_id: input.itemId,
    quantity_added: quantityAdded,
    unit_cost_cents: unitCostCents,
    total_cost_cents: totalCostCents,
    containers,
    container_cost_cents: containerCostCents,
    added_by: input.addedBy,
    note: input.note ?? null,
  });

  return { ok: true, quantityAdded, unitCostCents, newStock: newStock ?? 0 };
}
