"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { formatJmd } from "@/lib/bar/pos";

type ActionState = { error: string } | { ok: string } | null;

export type StockTarget = {
  id: string;
  name: string;
  bottleYield: number | null; // set → sold by the bottle (this many units per bottle)
  priceJmd: number;
};

const INPUT = "studio-field";
const LABEL = "studio-field-label";

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
  const uid = useId();

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
      // Money is whole dollars: a bottle cost that doesn't divide evenly by its
      // yield rounds to the nearest dollar per unit, so unit × units may differ
      // slightly from the bottle total. Total is the authoritative spend.
      const perUnitJmd = Math.round(costDollars / yieldNum);
      return { units, perUnitJmd, totalJmd: Math.round(b * costDollars) };
    }
    const q = parseInt(quantity, 10);
    const costDollars = parseFloat(unitCost);
    if (!Number.isInteger(q) || q <= 0) return null;
    if (isNaN(costDollars) || costDollars < 0) return null;
    const perUnitJmd = Math.round(costDollars);
    return { units: q, perUnitJmd, totalJmd: q * perUnitJmd };
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
        <div role="alert" className="studio-error">
          {localError ?? (state && "error" in state ? state.error : "")}
        </div>
      )}
      {state && "ok" in state && (
        <div className="studio-success">
          {state.ok}
        </div>
      )}

      {phase === "edit" ? (
        <>
          {targets.length > 1 && (
            <div>
              <label htmlFor={`${uid}-f1`} className={LABEL}>Turn this bottle into</label>
              <select
id={`${uid}-f1`}
                value={targetId}
                onChange={(e) => {
                  setTargetId(e.target.value);
                  const t = targets.find((x) => x.id === e.target.value);
                  setBottleYield(String(t?.bottleYield ?? ""));
                }}
                className={INPUT}
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
                  <label htmlFor={`${uid}-f2`} className={LABEL}>Bottles</label>
                  <input
id={`${uid}-f2`}
                    type="number"
                    min="1"
                    step="1"
                    value={containers}
                    onChange={(e) => setContainers(e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor={`${uid}-f3`} className={LABEL}>Cost per bottle</label>
                  <input
id={`${uid}-f3`}
                    type="number"
                    min="0"
                    step="1"
                    value={containerCost}
                    onChange={(e) => setContainerCost(e.target.value)}
                    placeholder="4000"
                    className={INPUT}
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor={`${uid}-f4`} className={LABEL}>Units per bottle (e.g. 750ml ≈ 16 shots, 1L ≈ 22)</label>
                  <input
id={`${uid}-f4`}
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
                  <label htmlFor={`${uid}-f5`} className={LABEL}>Units</label>
                  <input
id={`${uid}-f5`}
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor={`${uid}-f6`} className={LABEL}>Cost each</label>
                  <input
id={`${uid}-f6`}
                    type="number"
                    min="0"
                    step="1"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="0"
                    className={INPUT}
                  />
                </div>
              </>
            )}
          </div>

          {preview && isBottle && (
            <p className="studio-hint">
              Adds <span className="text-paper">{preview.units}</span> × {target?.name} at{" "}
              <span className="studio-money text-[16px]">{formatJmd(preview.perUnitJmd)}</span> each.
            </p>
          )}

          <button
            type="button"
            onClick={handleReview}
            className="studio-btn studio-btn-secondary"
          >
            Add stock…
          </button>
        </>
      ) : (
        preview && (
          <div className="space-y-3 border border-muted bg-raised p-3">
            <p className="text-[15px] text-paper">
              Add <span className="font-semibold">{preview.units} {target?.name}</span> at{" "}
              <span className="studio-money text-[18px]">{formatJmd(preview.perUnitJmd)}</span> each
              {" — "}total cost <span className="studio-money text-[18px]">{formatJmd(preview.totalJmd)}</span>.
            </p>
            <p className="studio-hint">This can’t be removed once added. Confirm it’s right.</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={pending}
                className="studio-btn studio-btn-primary"
              >
                {pending ? "Adding…" : "Confirm & add"}
              </button>
              <button
                type="button"
                onClick={() => setPhase("edit")}
                disabled={pending}
                className="studio-btn studio-btn-quiet"
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
