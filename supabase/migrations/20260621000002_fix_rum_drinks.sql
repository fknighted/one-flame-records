-- Split "Ting & Rum Ginger Beer" into two separate drinks
-- and correct the plain rum price

-- Rename existing combined item to "Ting & Rum"
UPDATE public.pos_items
SET name = 'Ting & Rum', updated_at = now()
WHERE name = 'Ting & Rum Ginger Beer' AND category = 'drink';

-- Add the separate "Ginger Beer & Rum"
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Ginger Beer & Rum', 'drink', 40000, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Ginger Beer & Rum');

-- Rename "Rum Shot" → "Rum" and correct price to $200
UPDATE public.pos_items
SET name = 'Rum', price_cents = 20000, updated_at = now()
WHERE name = 'Rum Shot' AND category = 'drink';
