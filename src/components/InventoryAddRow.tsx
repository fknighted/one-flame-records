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
  priceJmd: number;
};

function StockPill({ stock, threshold }: { stock: number | null; threshold: number }) {
  if (stock === null) return <span className="text-muted text-[13px]">not tracked</span>;
  if (stock === 0) return <span className="studio-chip studio-chip-bad">OUT</span>;
  const low = stock < threshold;
  return (
    <span className="inline-flex items-center gap-2">
      {low && <span className="studio-chip studio-chip-bad">Low</span>}
      <span className="studio-count">{stock}</span>
    </span>
  );
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
    priceJmd: r.priceJmd,
  }));
  const anyLow = rows.some((r) => r.stock !== null && r.stock < r.threshold);

  return (
    <div className={`border bg-panel ${open ? "border-muted" : "border-line"}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="studio-focus w-full min-h-[52px] flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-paper font-semibold [overflow-wrap:anywhere]">{title}</span>
        <span className="flex items-center gap-3">
          {!isGroup && <StockPill stock={rows[0].stock} threshold={rows[0].threshold} />}
          {isGroup && anyLow && <span className="studio-chip studio-chip-bad">low</span>}
          <svg
            className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-line">
          {isGroup && (
            <div className="space-y-1 pt-2">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 text-[15px]">
                  <span className="text-muted">{r.name}</span>
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
