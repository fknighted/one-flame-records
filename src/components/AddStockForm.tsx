"use client";

import { useActionState, useMemo, useState } from "react";
import { formatCents } from "@/lib/bar/pos";

type ActionState = { error: string } | { ok: string } | null;

export type StockTarget = {
  id: string;
  name: string;
  bottleYield: number | null; // set → sold by the bottle (this many units per bottle)
  priceCents: number;
};

const INPUT =
  "w-full bg-bone/5 border border-bone/15 rounded px-2.5 py-1.5 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-[11px] text-bone/50 mb-1";

/**
 * Add-only stock entry. Bartenders can only add — there is no remove path here.
 * A confirmation step is required before anything is written, since an add
 * can't be undone by staff.
 *
 * Pass multiple `targets` (the shot/flask/bottle siblings of one spirit) to get
 * an output-form picker; a single target renders a plain add.
 */
export default function AddStockForm({
  action,
  targets,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  targets: StockTarget[];
}) {
  const [state, formAction, pending] = useActionState(action, null);

  const [targetId, setTargetId] = useState(targets[0]?.id ?? "");
  const [containers, setContainers] = useState("1");
  const [containerCost, setContainerCost] = useState("");
  const [bottleYield, setBottleYield] = useState(String(targets[0]?.bottleYield ?? ""));
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [phase, setPhase] = useState<"edit" | "confirm">("edit");
  const [localError, setLocalError] = useState<string | null>(null);

  const target = targets.find((t) => t.id === targetId) ?? targets[0];
  const isBottle = !!target?.bottleYield;
  const yieldNum = parseInt(bottleYield, 10);

  // Respond to a new action result during render (React's "adjust state when a
  // prop/derived value changes" pattern — avoids a setState-in-effect cascade).
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setPhase("edit"); // both success and error return to the editable form
    if (state && "ok" in state) {
      setContainers("1");
      setContainerCost("");
      setQuantity("1");
      setUnitCost("");
      setLocalError(null);
    }
  }

  // Derived preview of exactly what will be added.
  const preview = useMemo(() => {
    if (isBottle) {
      const b = parseInt(containers, 10);
      const costDollars = parseFloat(containerCost);
      if (!Number.isInteger(b) || b <= 0) return null;
      if (isNaN(costDollars) || costDollars < 0) return null;
      if (!Number.isInteger(yieldNum) || yieldNum <= 0) return null;
      const units = b * yieldNum;
      const perUnitCents = Math.round((costDollars * 100) / yieldNum);
      return { units, perUnitCents, totalCents: Math.round(b * costDollars * 100) };
    }
    const q = parseInt(quantity, 10);
    const costDollars = parseFloat(unitCost);
    if (!Number.isInteger(q) || q <= 0) return null;
    if (isNaN(costDollars) || costDollars < 0) return null;
    const perUnitCents = Math.round(costDollars * 100);
    return { units: q, perUnitCents, totalCents: q * perUnitCents };
  }, [isBottle, containers, containerCost, yieldNum, quantity, unitCost]);

  function handleReview() {
    if (!preview) {
      setLocalError(isBottle ? "Enter bottles, units per bottle, and the bottle cost." : "Enter quantity and unit cost.");
      return;
    }
    setLocalError(null);
    setPhase("confirm");
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="item_id" value={target?.id ?? ""} />
      {isBottle ? (
        <>
          <input type="hidden" name="containers" value={containers} />
          <input type="hidden" name="container_cost" value={containerCost} />
          <input type="hidden" name="bottle_yield" value={bottleYield} />
        </>
      ) : (
        <>
          <input type="hidden" name="quantity" value={quantity} />
          <input type="hidden" name="unit_cost" value={unitCost} />
        </>
      )}

      {(localError || (state && "error" in state)) && (
        <div className="bg-oxblood/20 border border-oxblood/50 rounded px-3 py-2 text-xs text-bone">
          {localError ?? (state && "error" in state ? state.error : "")}
        </div>
      )}
      {state && "ok" in state && (
        <div className="bg-forest/25 border border-forest/50 rounded px-3 py-2 text-xs text-bone">
          {state.ok}
        </div>
      )}

      {phase === "edit" ? (
        <>
          {targets.length > 1 && (
            <div>
              <label className={LABEL}>Turn this bottle into</label>
              <select
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  const t = targets.find((x) => x.id === e.target.value);
                  setBottleYield(String(t?.bottleYield ?? ""));
                }}
                className={INPUT + " bg-ink"}
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.bottleYield ? ` — ${t.bottleYield} per bottle` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {isBottle ? (
              <>
                <div>
                  <label className={LABEL}>Bottles</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={containers}
                    onChange={(e) => setContainers(e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Cost per bottle</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={containerCost}
                    onChange={(e) => setContainerCost(e.target.value)}
                    placeholder="4000.00"
                    className={INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Units per bottle (e.g. 750ml ≈ 16 shots, 1L ≈ 22)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={bottleYield}
                    onChange={(e) => setBottleYield(e.target.value)}
                    placeholder="16"
                    className={INPUT}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={LABEL}>Units</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Cost each</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0.00"
                    className={INPUT}
                  />
                </div>
              </>
            )}
          </div>

          {preview && isBottle && (
            <p className="text-[11px] text-bone/50">
              Adds <span className="text-bone">{preview.units}</span> × {target?.name} at{" "}
              <span className="text-bone">{formatCents(preview.perUnitCents)}</span> each.
            </p>
          )}

          <button
            type="button"
            onClick={handleReview}
            className="text-xs text-ochre px-3 py-1.5 border border-ochre/30 rounded hover:border-ochre/60 transition-colors"
          >
            Add stock…
          </button>
        </>
      ) : (
        preview && (
          <div className="space-y-3 rounded-lg border border-ochre/30 bg-ochre/5 p-3">
            <p className="text-sm text-bone">
              Add <span className="font-semibold">{preview.units} {target?.name}</span> at{" "}
              <span className="font-semibold">{formatCents(preview.perUnitCents)}</span> each
              {" — "}total cost <span className="font-semibold">{formatCents(preview.totalCents)}</span>.
            </p>
            <p className="text-[11px] text-bone/50">This can’t be removed once added. Confirm it’s right.</p>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={pending}
                className="bg-ochre text-ink text-xs font-semibold px-4 py-1.5 rounded hover:bg-ochre/90 disabled:opacity-50 transition-colors"
              >
                {pending ? "Adding…" : "Confirm & add"}
              </button>
              <button
                type="button"
                onClick={() => setPhase("edit")}
                disabled={pending}
                className="text-xs text-bone/50 hover:text-bone px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )
      )}
    </form>
  );
}
