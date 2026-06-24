-- Atomically increment a tab item's quantity by 1
CREATE OR REPLACE FUNCTION increment_tab_item_quantity(p_tab_item_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE pos_tab_items SET quantity = quantity + 1 WHERE id = p_tab_item_id;
$$;

-- Atomically decrement a tab item's quantity by 1 (minimum 1, caller handles the zero case)
CREATE OR REPLACE FUNCTION decrement_tab_item_quantity(p_tab_item_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE pos_tab_items SET quantity = GREATEST(quantity - 1, 1) WHERE id = p_tab_item_id;
$$;
