-- Add session duration type and price to game_sessions.
-- half_hour = 30 min @ $300 JMD, one_hour = 60 min @ $600 JMD.
-- Existing sessions get null (legacy rows with no fixed duration).
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS duration_type text
    CHECK (duration_type IN ('half_hour', 'one_hour')),
  ADD COLUMN IF NOT EXISTS price_jmd     int;
