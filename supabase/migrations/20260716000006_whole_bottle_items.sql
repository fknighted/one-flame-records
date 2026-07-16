-- Whole-bottle sale items for the split spirits.
--
-- Model: a whole bottle draws from the SHOT pool (shared stock). Selling one
-- bottle deducts the parent shot item's bottle_yield (e.g. 16) shots. The
-- bottle option is only offered when MORE THAN one bottle's worth of shots
-- remains (parent stock > bottle_yield), so the last bottle is never sold whole
-- by accident.

-- Link a whole-bottle item to the shot item whose stock pool it draws from.
ALTER TABLE public.pos_items
  ADD COLUMN IF NOT EXISTS bottle_parent_id uuid REFERENCES public.pos_items(id) ON DELETE SET NULL;

-- Atomically decrement N units if at least N are in stock (bottle sale draws
-- bottle_yield shots at once). Returns false if not enough / untracked.
CREATE OR REPLACE FUNCTION decrement_pos_item_stock_by(p_item_id uuid, p_qty int)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows integer;
BEGIN
  UPDATE pos_items
  SET stock_quantity = stock_quantity - p_qty
  WHERE id = p_item_id
    AND stock_quantity IS NOT NULL
    AND stock_quantity >= p_qty;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

-- Create the whole-bottle SKUs, each linked to its shot parent.
-- price_cents: Rum/J B/Kingston 62/Fever = $7,500; Campari = $6,000.
-- No own stock (derives from parent), no bottle_yield (sold as one unit).
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, menu_section, bottle_parent_id)
SELECT 'Rum (Bottle)', 'drink', 750000, true, 5, 'rum', p.id
FROM public.pos_items p WHERE p.name = 'Rum Shot' AND p.category = 'drink'
  AND NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum (Bottle)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, menu_section, bottle_parent_id)
SELECT 'J B Rum (Bottle)', 'drink', 750000, true, 6, 'rum', p.id
FROM public.pos_items p WHERE p.name = 'J B Rum Shot' AND p.category = 'drink'
  AND NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'J B Rum (Bottle)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, menu_section, bottle_parent_id)
SELECT 'Kingston 62 (Bottle)', 'drink', 750000, true, 7, 'rum', p.id
FROM public.pos_items p WHERE p.name = 'Kingston 62 Shot' AND p.category = 'drink'
  AND NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Kingston 62 (Bottle)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, menu_section, bottle_parent_id)
SELECT 'Fever (Bottle)', 'drink', 750000, true, 8, 'rum', p.id
FROM public.pos_items p WHERE p.name = 'Fever Shot' AND p.category = 'drink'
  AND NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Fever (Bottle)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, menu_section, bottle_parent_id)
SELECT 'Campari (Bottle)', 'drink', 600000, true, 9, 'other', p.id
FROM public.pos_items p WHERE p.name = 'Campari Shot' AND p.category = 'drink'
  AND NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Campari (Bottle)');
