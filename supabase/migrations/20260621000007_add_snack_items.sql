-- Extend category constraint to include 'snack'
ALTER TABLE public.pos_items
  DROP CONSTRAINT pos_items_category_check,
  ADD CONSTRAINT pos_items_category_check
    CHECK (category IN ('drink', 'beverage', 'food', 'snack', 'game_time'));

-- Add snack items
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT name, category, price_cents, true, sort_order
FROM (VALUES
  ('YardWorks Banana Chips',         'snack', 20000, 10),
  ('YardWorks Plantain Chips',       'snack', 20000, 20),
  ('YardWorks Ripe Plantain Chips',  'snack', 20000, 30),
  ('Big Foot Regular',               'snack', 20000, 40),
  ('Big Foot Spicy',                 'snack', 20000, 50),
  ('Sausage Regular',                'snack', 30000, 60),
  ('Sausage Spicy',                  'snack', 30000, 70),
  ('Cup Soup',                       'snack', 25000, 80)
) AS v(name, category, price_cents, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.pos_items WHERE pos_items.name = v.name
);
