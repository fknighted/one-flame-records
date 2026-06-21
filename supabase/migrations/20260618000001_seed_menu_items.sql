-- Seed Flames Lounge menu items
-- Idempotent: WHERE NOT EXISTS prevents duplicates on re-run

-- ── Food (prices confirmed by owner) ─────────────────────────────────────────

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Fish Fritters', 'food', 15000, true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Fish Fritters');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Jerk Chicken Fritters', 'food', 20000, true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Jerk Chicken Fritters');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Vegetable Fritters', 'food', 15000, true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Vegetable Fritters');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Steamed Vegetables', 'food', 20000, true, 4
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Steamed Vegetables');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Signature Sauces', 'food', 5000, true, 5
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Signature Sauces');

-- ── Alcoholic drinks (prices to be set via /admin/bar/items) ─────────────────

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Red Stripe Beer', 'drink', 0, true, 10
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Red Stripe Beer');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Heineken', 'drink', 0, true, 11
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Heineken');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Guinness', 'drink', 0, true, 12
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Guinness');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Dragon Stout', 'drink', 0, true, 13
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Dragon Stout');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Rum Punch', 'drink', 0, true, 14
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum Punch');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Rum & Coke', 'drink', 0, true, 15
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Rum & Coke');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Vodka & Juice', 'drink', 0, true, 16
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Vodka & Juice');

-- ── Non-alcoholic beverages (prices to be set via /admin/bar/items) ──────────

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Ting', 'beverage', 0, true, 20
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Ting');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Pepsi', 'beverage', 0, true, 21
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Pepsi');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Sprite', 'beverage', 0, true, 22
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Sprite');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Water (Bottle)', 'beverage', 0, true, 23
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Water (Bottle)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Cranberry Juice', 'beverage', 0, true, 24
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Cranberry Juice');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Orange Juice', 'beverage', 0, true, 25
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Orange Juice');
