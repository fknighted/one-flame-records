-- Corrective follow-up to 20260716000001.
--
-- That migration seeded a "rum family" (Rum Shot / Rum Flask / Rum (Bottle))
-- assuming a single legacy 'Rum' item. Production had already diverged: the
-- real sellable items are 'Rum Shot' and 'J B Rum Shot' (two brands, each its
-- own bottle) plus 'Rum - Half Flask'. This removes the two placeholder rows
-- that were added ($0, inactive) and tags the real items as bottle-portioned.
--
-- bottle_yield is only a DEFAULT prefill — the units-per-bottle is editable when
-- adding stock, because 750ml vs 1L bottles pour a different number of 1.5oz
-- shots (~16 vs ~22). bottle_group is left NULL: the two brands are stocked
-- independently and the half-flask can be poured from either brand's bottle, so
-- no fixed grouping applies.

-- Remove the placeholder rows added by 20260716000001 (only the exact $0,
-- inactive, group='rum' rows — never touches real menu items).
DELETE FROM public.pos_items
WHERE name IN ('Rum Flask', 'Rum (Bottle)')
  AND bottle_group = 'rum'
  AND price_cents = 0
  AND is_active = false;

-- Tag the real items with a default units-per-bottle (editable at add-time).
UPDATE public.pos_items SET bottle_yield = 16, bottle_group = NULL, updated_at = now()
WHERE name = 'Rum Shot' AND category = 'drink';

UPDATE public.pos_items SET bottle_yield = 16, bottle_group = NULL, updated_at = now()
WHERE name = 'J B Rum Shot' AND category = 'drink';

-- Half-flask default of 4 per bottle is a starting point — adjust per purchase.
UPDATE public.pos_items SET bottle_yield = 4, bottle_group = NULL, updated_at = now()
WHERE name = 'Rum - Half Flask' AND category = 'drink';
