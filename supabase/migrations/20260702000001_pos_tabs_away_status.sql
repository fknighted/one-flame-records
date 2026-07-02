-- Add 'away' status to pos_tabs.
-- 'away' means the customer has left and the tab is locked (no new items),
-- but remains unpaid — they will return to settle later.
ALTER TABLE public.pos_tabs
  DROP CONSTRAINT IF EXISTS pos_tabs_status_check;

ALTER TABLE public.pos_tabs
  ADD CONSTRAINT pos_tabs_status_check
  CHECK (status IN ('open', 'closed', 'voided', 'away'));
