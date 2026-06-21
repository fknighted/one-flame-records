-- Update menu items to match confirmed Flames Lounge menu with real prices
-- Deactivates items no longer on the menu; adds new items; sets all prices in JMD cents

-- ── Beverages: update prices ──────────────────────────────────────────────────

UPDATE public.pos_items SET price_cents = 25000, updated_at = now() WHERE name = 'Pepsi'         AND category = 'beverage';
UPDATE public.pos_items SET price_cents = 25000, updated_at = now() WHERE name = 'Ting'          AND category = 'beverage';

-- Rename "Water (Bottle)" → "Regular Water" and set price
UPDATE public.pos_items SET name = 'Regular Water', price_cents = 15000, updated_at = now() WHERE name = 'Water (Bottle)' AND category = 'beverage';

-- Deactivate beverages removed from menu
UPDATE public.pos_items SET is_active = false, updated_at = now() WHERE name = 'Sprite'          AND category = 'beverage';
UPDATE public.pos_items SET is_active = false, updated_at = now() WHERE name = 'Orange Juice'    AND category = 'beverage';
UPDATE public.pos_items SET is_active = false, updated_at = now() WHERE name = 'Cranberry Juice' AND category = 'beverage';

-- Add new beverages
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Ginger Beer', 'beverage', 25000, true, 26
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Ginger Beer');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Cran Water', 'beverage', 25000, true, 27
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Cran Water');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Red Cranberry', 'beverage', 35000, true, 28
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Red Cranberry');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'White Cranberry', 'beverage', 35000, true, 29
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'White Cranberry');

-- ── Drinks: update prices ────────────────────────────────────────────────────

UPDATE public.pos_items SET price_cents = 45000, updated_at = now() WHERE name = 'Heineken'      AND category = 'drink';
UPDATE public.pos_items SET price_cents = 45000, updated_at = now() WHERE name = 'Red Stripe Beer' AND category = 'drink';
UPDATE public.pos_items SET price_cents = 50000, updated_at = now() WHERE name = 'Guinness'      AND category = 'drink';
UPDATE public.pos_items SET price_cents = 50000, updated_at = now() WHERE name = 'Dragon Stout'  AND category = 'drink';

-- Deactivate drinks removed from menu
UPDATE public.pos_items SET is_active = false, updated_at = now() WHERE name = 'Rum Punch'    AND category = 'drink';
UPDATE public.pos_items SET is_active = false, updated_at = now() WHERE name = 'Rum & Coke'   AND category = 'drink';
UPDATE public.pos_items SET is_active = false, updated_at = now() WHERE name = 'Vodka & Juice' AND category = 'drink';

-- Add new drinks
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Special (Rum & Boom)', 'drink', 40000, true, 17
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Special (Rum & Boom)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Campari Special', 'drink', 45000, true, 18
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Campari Special');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Ting & Rum Ginger Beer', 'drink', 40000, true, 19
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Ting & Rum Ginger Beer');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Rum Pepsi', 'drink', 40000, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum Pepsi');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Rum Shot', 'drink', 25000, true, 21
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum Shot');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Light Beer', 'drink', 45000, true, 22
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Light Beer');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Sorrel Beer', 'drink', 45000, true, 23
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Sorrel Beer');
