INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Boom (Small)', 'beverage', 35000, true, 30
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Boom (Small)');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Boom (Large)', 'beverage', 40000, true, 31
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Boom (Large)');
