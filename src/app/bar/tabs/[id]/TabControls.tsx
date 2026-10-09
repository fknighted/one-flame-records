"use client";

import { useActionState, useState } from "react";
import { closeTab, voidTab, markTabAway, reopenTab } from "./actions";
import { formatJmd } from "@/lib/bar/pos";

interface Props {
  tabId: string;
  total: number;
  tabName: string;
  status: "open" | "away";
}

export default function TabControls({ tabId, total, tabName, status }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClose,   setShowClose]   = useState(false);
  const [showVoid,    setShowVoid]    = useState(false);
  const [tipInput,  setTipInput]  = useState("");
  const [closeState, closeAction, closePending] = useActionState(closeTab, null);
  const [voidState,  voidAction,  voidPending]  = useActionState(voidTab, null);
  const [awayState,  awayAction,  awayPending]  = useActionState(markTabAway, null);
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenTab, null);

  // Tips are whole dollars, same as every other amount — no conversion.
  const tipJmd     = Math.max(0, Math.round(Number(tipInput || "0")));
  const grandTotal = total + tipJmd;

  if (showVoid) {
    return (
      <form action={voidAction} className="space-y-3">
        <input type="hidden" name="tab_id" value={tabId} />
        <p className="text-[15px] text-muted text-center">
          Void this tab? All items will be removed and no payment recorded.
        </p>
        {voidState?.error && (
          <p role="alert" className="studio-error text-center">{voidState.error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowVoid(false)}
            className="studio-btn studio-btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={voidPending}
            className="studio-btn studio-btn-danger flex-1"
          >
            {voidPending ? "Voiding…" : "Confirm Void"}
          </button>
        </div>
      </form>
    );
  }

  if (showConfirm) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <p className="text-paper font-semibold text-[16px]">Close tab for {tabName}?</p>
          <p className="studio-money text-[32px]">{formatJmd(total)}</p>
          <p className="text-[13px] text-muted">This cannot be undone once payment is recorded.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowConfirm(false)}
            className="studio-btn studio-btn-secondary flex-1"
          >
            Not yet
          </button>
          <button
            type="button"
            onClick={() => { setShowConfirm(false); setShowClose(true); }}
            className="studio-btn studio-btn-primary flex-1"
          >
            Yes, close it
          </button>
        </div>
      </div>
    );
  }

  if (showClose) {
    return (
      <form action={closeAction} className="space-y-3">
        <input type="hidden" name="tab_id" value={tabId} />
        <input type="hidden" name="tip_jmd" value={tipJmd} />
        <p className="text-[15px] font-semibold text-paper text-center">
          Total: <span className="studio-money">{formatJmd(total)}</span>
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="tip_input" className="text-[14px] text-paper shrink-0">Tip (JMD$)</label>
          <input
            id="tip_input"
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={tipInput}
            onChange={e => setTipInput(e.target.value)}
            className="studio-field flex-1 min-w-0 text-right studio-figures"
          />
        </div>
        {tipJmd > 0 && (
          <p className="text-[14px] text-muted text-center">
            With tip: <span className="studio-money text-[20px]">{formatJmd(grandTotal)}</span>
          </p>
        )}
        <p className="text-[14px] text-muted text-center">How was this paid?</p>
        {closeState?.error && (
          <p role="alert" className="studio-error text-center">{closeState.error}</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {(["cash", "comp"] as const).map(method => (
            <button
              key={method}
              type="submit"
              name="payment_method"
              value={method}
              disabled={closePending}
              className={`studio-btn !min-h-[52px] capitalize ${method === "cash" ? "studio-btn-primary" : "studio-btn-secondary"}`}
            >
              {method}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowClose(false)}
          className="studio-btn studio-btn-quiet w-full"
        >
          Cancel
        </button>
      </form>
    );
  }

  // ── Away state: customer has left, tab locked ──────────────────────────────
  if (status === "away") {
    return (
      <div className="space-y-3">
        <div className="studio-card text-center !py-3">
          <p className="studio-label">Customer Left</p>
          <p className="text-[13px] text-muted mt-0.5">Tab locked — no new items can be added</p>
        </div>
        {awayState?.error  && <p role="alert" className="studio-error text-center">{awayState.error}</p>}
        {reopenState?.error && <p role="alert" className="studio-error text-center">{reopenState.error}</p>}
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="studio-btn studio-btn-primary w-full !min-h-[52px]"
        >
          Collect Payment — {formatJmd(total)}
        </button>
        <div className="flex gap-2">
          <form action={reopenAction} className="flex-1">
            <input type="hidden" name="tab_id" value={tabId} />
            <button
              type="submit"
              disabled={reopenPending}
              className="studio-btn studio-btn-secondary w-full"
            >
              {reopenPending ? "Reopening…" : "Customer Returned — Reopen"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setShowVoid(true)}
            className="studio-btn studio-btn-danger"
          >
            Void
          </button>
        </div>
      </div>
    );
  }

  // ── Open state: normal controls ────────────────────────────────────────────
  return (
    <div className="space-y-2">
      {awayState?.error && <p role="alert" className="studio-error text-center">{awayState.error}</p>}
      <form action={awayAction}>
        <input type="hidden" name="tab_id" value={tabId} />
        <button
          type="submit"
          disabled={awayPending}
          className="studio-btn studio-btn-secondary w-full"
        >
          {awayPending ? "Saving…" : "Customer Left — Lock Tab"}
        </button>
      </form>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowVoid(true)}
          className="studio-btn studio-btn-danger"
        >
          Void
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="studio-btn studio-btn-primary flex-1 !min-h-[52px]"
        >
          Close Tab — {formatJmd(total)}
        </button>
      </div>
    </div>
  );
}
