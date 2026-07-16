"use client";

import { useState } from "react";
import AddStockForm, { type StockTarget } from "@/components/AddStockForm";

type ActionState = { error: string } | { ok: string } | null;

export type InvRow = {
  id: string;
  name: string;
  stock: number | null;
  threshold: number;
  bottleYield: number | null;
  priceCents: number;
};

function StockPill({ stock, threshold }: { stock: number | null; threshold: number }) {
  if (stock === null) return <span className="text-bone/40 text-xs">not tracked</span>;
  if (stock === 0) return <span className="text-red-400 font-bold text-sm">OUT</span>;
  const low = stock < threshold;
  return <span className={`font-mono font-bold text-sm ${low ? "text-red-400" : "text-bone"}`}>{stock}</span>;
}

/**
 * One collapsible inventory row: the header shows the item name + current stock
 * (red when low/out, so low stock is visible without a separate list), and
 * tapping it opens the add-stock form inline. `rows` holds one item normally, or
 * the sibling SKUs of a bottle group.
 */
export default function InventoryAddRow({
  action,
  title,
  rows,
  isGroup,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  title: string;
  rows: InvRow[];
  isGroup: boolean;
}) {
  const [open, setOpen] = useState(false);
  const targets: StockTarget[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    bottleYield: r.bottleYield,
    priceCents: r.priceCents,
  }));
  const anyLow = rows.some((r) => r.stock !== null && r.stock < r.threshold);

  return (
    <div className={`rounded-lg border ${open ? "border-ochre/40" : anyLow ? "border-red-400/25" : "border-bone/10"} transition-colors`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-bone font-medium">{title}</span>
        <span className="flex items-center gap-3">
          {!isGroup && <StockPill stock={rows[0].stock} threshold={rows[0].threshold} />}
          {isGroup && anyLow && <span className="text-red-400 text-xs font-semibold">low</span>}
          <svg
            className={`w-4 h-4 text-bone/40 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-bone/10">
          {isGroup && (
            <div className="space-y-1 pt-2">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-bone/70">{r.name}</span>
                  <StockPill stock={r.stock} threshold={r.threshold} />
                </div>
              ))}
            </div>
          )}
          <AddStockForm action={action} targets={targets} />
        </div>
      )}
    </div>
  );
}
