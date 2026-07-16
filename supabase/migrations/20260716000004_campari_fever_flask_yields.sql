-- More spirits poured from a bottle → give them a default bottle_yield
-- (editable at add-time), matching the rum shot/half-flask setup.
--   Shots pour ~16 × 1.5oz from a 750ml bottle.
--   Half-flasks: ~4 per bottle (same default as Rum - Half Flask).

UPDATE public.pos_items SET bottle_yield = 16, updated_at = now()
WHERE name = 'Campari Shot' AND category = 'drink';

UPDATE public.pos_items SET bottle_yield = 4, updated_at = now()
WHERE name = 'Campari Half flask' AND category = 'drink';

UPDATE public.pos_items SET bottle_yield = 4, updated_at = now()
WHERE name = 'Fever - half flask' AND category = 'drink';
