-- Add Campari (shot) and Kingston 62 (shot) at $200 each

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Campari', 'drink', 20000, true, 24
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Campari');

INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Kingston 62', 'drink', 20000, true, 25
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Kingston 62');
