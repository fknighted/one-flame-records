-- Inventory display sections: split the broad "drink" category into Rums /
-- Beers / Other Drinks and pull Cigarettes to the bottom, so items are easier
-- to find. This is an inventory-view grouping only — the POS `category`
-- (drink/beverage/food/snack/game_time) used by the order screen and sales
-- report is unchanged. New items default to "Other Drinks" until classified in
-- the admin item editor.

ALTER TABLE public.pos_items ADD COLUMN IF NOT EXISTS menu_section text;

-- Rums (incl. Fever, per the owner, and rum-based cream)
UPDATE public.pos_items SET menu_section = 'rum', updated_at = now()
WHERE name IN ('Rum Shot', 'J B Rum Shot', 'Kingston 62 Shot', 'Rum - Half Flask', 'Rum Cream', 'Fever Shot', 'Fever - half flask');

-- Beers / stouts
UPDATE public.pos_items SET menu_section = 'beer', updated_at = now()
WHERE name IN ('Guinness', 'Heineken', 'Red Stripe Beer', 'Dragon Stout', 'Lemon Beer', 'Light Beer', 'Sorrel Beer');

-- Cigarettes (rendered last)
UPDATE public.pos_items SET menu_section = 'cigarette', updated_at = now()
WHERE name IN ('Craven A (Single)', 'Matterhorn (Single)');

-- Everything else in the drink category → Other Drinks
UPDATE public.pos_items SET menu_section = 'other', updated_at = now()
WHERE category = 'drink' AND menu_section IS NULL;
