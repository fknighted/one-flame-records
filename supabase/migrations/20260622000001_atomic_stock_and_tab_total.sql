-- Atomically decrements stock_quantity for a tracked POS item.
-- Returns true if decremented, false if stock was already 0 (race: someone else took the last one).
CREATE OR REPLACE FUNCTION decrement_pos_item_stock(p_item_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE pos_items
  SET stock_quantity = stock_quantity - 1
  WHERE id = p_item_id
    AND stock_quantity IS NOT NULL
    AND stock_quantity > 0;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- Atomically increments a tab total (used after adding an item).
CREATE OR REPLACE FUNCTION increment_tab_total(p_tab_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE pos_tabs
  SET total_cents = total_cents + p_amount
  WHERE id = p_tab_id AND status = 'open';
$$;

-- Atomically decrements a tab total, floored at 0 (used after removing an item).
CREATE OR REPLACE FUNCTION decrement_tab_total(p_tab_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE pos_tabs
  SET total_cents = GREATEST(0, total_cents - p_amount)
  WHERE id = p_tab_id AND status = 'open';
$$;
