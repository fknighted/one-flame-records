-- Inventory cost capture + add-only stock purchases + profit support.
--
-- Adds unit cost tracking to menu items, a cost snapshot on sold line items
-- (so historical profit is locked at sale time), an append-only purchase
-- ledger, and an atomic add-stock RPC. Also seeds the rum "bottle family"
-- (shot / flask / whole bottle) so a purchased bottle can be broken down.

-- ─────────────────────────────────────────────────────────────
-- pos_items: unit cost + sold-by-bottle metadata
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pos_items
  ADD COLUMN IF NOT EXISTS cost_cents   int,   -- current unit cost (JMD × 100); NULL = unknown
  ADD COLUMN IF NOT EXISTS bottle_group text,  -- items sharing a value are one spirit sold different ways (e.g. 'rum')
  ADD COLUMN IF NOT EXISTS bottle_yield int;   -- units one purchased bottle yields for THIS sku (shot=16, flask=4, bottle=1)

-- ─────────────────────────────────────────────────────────────
-- pos_tab_items: snapshot the unit cost at time of sale
-- (mirrors how price_cents is already captured — locks profit to sale time)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pos_tab_items
  ADD COLUMN IF NOT EXISTS cost_cents int;

-- ─────────────────────────────────────────────────────────────
-- pos_stock_purchases — append-only ledger of inventory additions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_stock_purchases (
  id                   uuid        primary key default gen_random_uuid(),
  pos_item_id          uuid        not null references public.pos_items(id) on delete cascade,
  quantity_added       int         not null check (quantity_added > 0),
  unit_cost_cents      int         not null check (unit_cost_cents >= 0),
  total_cost_cents     int         not null check (total_cost_cents >= 0),
  containers           int         check (containers > 0),          -- # of bottles purchased (null for by-the-unit adds)
  container_cost_cents int         check (container_cost_cents >= 0), -- cost per bottle (null for by-the-unit adds)
  added_by             uuid        references auth.users(id) on delete set null,
  note                 text,
  created_at           timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS pos_stock_purchases_item_created_idx
  ON public.pos_stock_purchases (pos_item_id, created_at DESC);

ALTER TABLE public.pos_stock_purchases ENABLE ROW LEVEL SECURITY;

-- Bar staff (admin + bartender) can read the ledger; all writes go through the
-- service client / SECURITY DEFINER RPC, so there is no insert/update/delete policy.
CREATE POLICY "pos_stock_purchases_select_bar_staff"
  ON public.pos_stock_purchases FOR SELECT
  USING (public.is_bar_staff());

-- ─────────────────────────────────────────────────────────────
-- add_pos_item_stock — atomically ADD stock and set the current unit cost.
-- Never decrements (add-only). Treats a NULL stock_quantity as 0 so the item
-- becomes tracked on first purchase. Returns the new stock level.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_pos_item_stock(
  p_item_id        uuid,
  p_qty            int,
  p_unit_cost_cents int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock int;
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RAISE EXCEPTION 'add_pos_item_stock: quantity must be positive (got %)', p_qty;
  END IF;

  UPDATE pos_items
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_qty,
      cost_cents     = COALESCE(p_unit_cost_cents, cost_cents),
      updated_at     = now()
  WHERE id = p_item_id
  RETURNING stock_quantity INTO v_new_stock;

  IF v_new_stock IS NULL THEN
    RAISE EXCEPTION 'add_pos_item_stock: item % not found', p_item_id;
  END IF;

  RETURN v_new_stock;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- Seed the rum bottle family.
-- Existing 'Rum' item is the shot; relabel it and mark its yield (16 shots/bottle).
-- ─────────────────────────────────────────────────────────────
UPDATE public.pos_items
SET name = 'Rum Shot', bottle_group = 'rum', bottle_yield = 16, updated_at = now()
WHERE name = 'Rum' AND category = 'drink';

-- Flask (4 per bottle) and whole bottle (1) — added inactive; admin sets the
-- sale price in the menu editor before activating them.
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, bottle_group, bottle_yield)
SELECT 'Rum Flask', 'drink', 0, false, 3, 'rum', 4
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum Flask');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, bottle_group, bottle_yield)
SELECT 'Rum (Bottle)', 'drink', 0, false, 4, 'rum', 1
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum (Bottle)');
