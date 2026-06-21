-- Add stock tracking to menu items
ALTER TABLE public.pos_items ADD COLUMN IF NOT EXISTS stock_quantity int;

-- Add Craven A (single cigarette) to drinks at $150
INSERT INTO public.pos_items (name, category, price_cents, is_active, sort_order)
SELECT 'Craven A (Single)', 'drink', 15000, true, 28
WHERE NOT EXISTS (SELECT 1 FROM public.pos_items WHERE name = 'Craven A (Single)');
