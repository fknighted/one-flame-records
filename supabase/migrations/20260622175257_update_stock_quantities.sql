-- Set current stock counts from physical inventory (2026-06-22)
-- NULL stock_quantity = untracked / always available.
-- Setting a number enables tracking: RPC decrements on each sale, UI disables at 0.

-- ── Beverages ────────────────────────────────────────────────────────────────
UPDATE public.pos_items SET stock_quantity = 1  WHERE name = 'Pepsi'          AND category = 'beverage';
UPDATE public.pos_items SET stock_quantity = 0  WHERE name = 'Ginger Beer'    AND category = 'beverage';
UPDATE public.pos_items SET stock_quantity = 0  WHERE name = 'Ting'           AND category = 'beverage';
UPDATE public.pos_items SET stock_quantity = 0  WHERE name = 'Boom (Small)'   AND category = 'beverage';
UPDATE public.pos_items SET stock_quantity = 0  WHERE name = 'Boom (Large)'   AND category = 'beverage';
UPDATE public.pos_items SET stock_quantity = 12 WHERE name = 'Regular Water'  AND category = 'beverage';

-- ── Drinks ───────────────────────────────────────────────────────────────────
-- Dragon: 1 in fridge + 9 in crate = 10
UPDATE public.pos_items SET stock_quantity = 10 WHERE name = 'Dragon Stout'    AND category = 'drink';
UPDATE public.pos_items SET stock_quantity = 9  WHERE name = 'Heineken'        AND category = 'drink';
UPDATE public.pos_items SET stock_quantity = 6  WHERE name = 'Sorrel Beer'     AND category = 'drink';
-- Red Stripe: 4 on shelf + 2 in crate = 6
UPDATE public.pos_items SET stock_quantity = 6  WHERE name = 'Red Stripe Beer' AND category = 'drink';
UPDATE public.pos_items SET stock_quantity = 2  WHERE name = 'Guinness'        AND category = 'drink';
UPDATE public.pos_items SET stock_quantity = 8  WHERE name = 'Magnum'          AND category = 'drink';
UPDATE public.pos_items SET stock_quantity = 5  WHERE name = 'Red Label Wine'  AND category = 'drink';
-- Craven A: 1 pack, 12 singles remaining
UPDATE public.pos_items SET stock_quantity = 12 WHERE name = 'Craven A (Single)' AND category = 'drink';

-- ── Snacks ───────────────────────────────────────────────────────────────────
-- 4 bigfoot bags total, split evenly across variants
UPDATE public.pos_items SET stock_quantity = 2  WHERE name = 'Big Foot Regular' AND category = 'snack';
UPDATE public.pos_items SET stock_quantity = 2  WHERE name = 'Big Foot Spicy'   AND category = 'snack';
-- 4 plantain chips bags
UPDATE public.pos_items SET stock_quantity = 4  WHERE name = 'YardWorks Plantain Chips' AND category = 'snack';
-- 4 sausages total, split evenly across variants
UPDATE public.pos_items SET stock_quantity = 2  WHERE name = 'Sausage Regular'  AND category = 'snack';
UPDATE public.pos_items SET stock_quantity = 2  WHERE name = 'Sausage Spicy'    AND category = 'snack';

-- ── New items not previously in DB ───────────────────────────────────────────
-- Prices are estimates — update via Admin → Bar → Items if needed

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, stock_quantity)
SELECT 'Smirnoff', 'drink', 50000, true, 29, 2
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Smirnoff');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, stock_quantity)
SELECT 'Rum Cream', 'drink', 40000, true, 30, 2
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum Cream');

-- Matterhorn: 1 pack, 8 singles remaining — same category/price as Craven A
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order, stock_quantity)
SELECT 'Matterhorn (Single)', 'drink', 15000, true, 31, 8
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Matterhorn (Single)');
