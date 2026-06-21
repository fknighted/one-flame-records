INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Magnum', 'drink', 70000, true, 26
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Magnum');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Red Label Wine', 'drink', 50000, true, 27
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Red Label Wine');
