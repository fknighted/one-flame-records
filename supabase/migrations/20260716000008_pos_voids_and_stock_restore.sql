-- Stock integrity for the +/−/remove line-item controls, plus a cancellation
-- (void) ledger so canceled sales are visible in Sales/Overview rather than
-- silently vanishing.
--
-- Background: stock was only ever decremented on the FIRST add of a line item
-- (addItemToTab). The + stepper (incrementTabItem) sold extra units without
-- decrementing stock; the − stepper and × remove deleted the sale without
-- restoring stock. Net effect: recorded stock drifts away from reality the
-- moment staff correct a mis-tap or bump a quantity. Whole-bottle SKUs drifted
-- worst (a + tap sold another $7,500 bottle while drawing zero shots).

-- ─────────────────────────────────────────────────────────────
-- Atomic stock RESTORE — the mirror of decrement_pos_item_stock_by.
-- Used when a sale is canceled (item removed / quantity decreased). Only
-- touches tracked items (stock_quantity IS NOT NULL); untracked items no-op.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_pos_item_stock_by(p_item_id uuid, p_qty int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows integer;
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RETURN false;
  END IF;
  UPDATE pos_items
  SET stock_quantity = stock_quantity + p_qty
  WHERE id = p_item_id
    AND stock_quantity IS NOT NULL;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- pos_voids — append-only ledger of canceled sales (mirrors the
-- pos_stock_purchases pattern). One row per cancellation event, snapshotting
-- the item name, quantity, and price/cost at the moment of cancellation so the
-- ledger stays accurate even if the item or its price/cost later changes.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_voids (
  id           uuid        primary key default gen_random_uuid(),
  tab_id       uuid        references public.pos_tabs(id) on delete set null,
  pos_item_id  uuid        references public.pos_items(id) on delete set null,
  name         text        not null,
  quantity     int         not null check (quantity > 0),
  price_cents  int         not null,            -- unit price at cancellation
  cost_cents   int,                             -- unit cost snapshot (nullable)
  reason       text,                            -- optional free-text / preset
  voided_by    uuid        references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS pos_voids_created_idx ON public.pos_voids (created_at DESC);
CREATE INDEX IF NOT EXISTS pos_voids_tab_idx     ON public.pos_voids (tab_id);

ALTER TABLE public.pos_voids ENABLE ROW LEVEL SECURITY;

-- Bar staff can read the ledger; all writes go through the service client, so
-- there is deliberately no insert/update/delete policy.
CREATE POLICY "pos_voids_select_bar_staff"
  ON public.pos_voids FOR SELECT
  USING (public.is_bar_staff());
