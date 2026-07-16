-- Fever Shot and Kingston 62 Shot are spirits sold by the shot, same as
-- Rum Shot / J B Rum Shot — bought by the bottle and poured into 1.5oz shots.
-- Give them the same default bottle_yield (16, editable at add-time for
-- 750ml vs 1L) so the bottle→shot cost breakdown applies.

UPDATE public.pos_items SET bottle_yield = 16, updated_at = now()
WHERE name = 'Fever Shot' AND category = 'drink';

UPDATE public.pos_items SET bottle_yield = 16, updated_at = now()
WHERE name = 'Kingston 62 Shot' AND category = 'drink';
