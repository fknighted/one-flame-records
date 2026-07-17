-- Two security-hardening changes:
--   1. Atomic gamer minute-balance adjustment (fixes lost-update race where a
--      concurrent top-up and session-deduction could erase each other).
--   2. A lightweight per-key throttle table for the public gamer-signup action
--      (limits invite-email abuse from a single source).

-- ─────────────────────────────────────────────────────────────
-- adjust_member_minutes — atomic balance change.
--   p_clamp_zero = true  → floor at 0 (session deductions; never underflow).
--   p_clamp_zero = false → apply only if the result stays >= 0 (admin adjust:
--                          a would-be-negative change is rejected → returns NULL).
-- Returns the new balance, or NULL when the member is missing / the change was
-- rejected. Read-modify-write is done in a single UPDATE so concurrent callers
-- can't clobber each other.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION adjust_member_minutes(
  p_member_id  uuid,
  p_delta      int,
  p_clamp_zero boolean DEFAULT true
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new int;
BEGIN
  IF p_clamp_zero THEN
    UPDATE gamer_members
    SET minutes_balance = GREATEST(0, COALESCE(minutes_balance, 0) + p_delta)
    WHERE id = p_member_id
    RETURNING minutes_balance INTO v_new;
  ELSE
    UPDATE gamer_members
    SET minutes_balance = COALESCE(minutes_balance, 0) + p_delta
    WHERE id = p_member_id
      AND COALESCE(minutes_balance, 0) + p_delta >= 0
    RETURNING minutes_balance INTO v_new;
  END IF;
  RETURN v_new;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- signup_throttle — append-only counter keyed by an opaque string
-- (e.g. "gamer-signup:<ip>"). Rows are counted within a time window by the
-- action; old rows are harmless and can be pruned later. Service-role only.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.signup_throttle (
  id         uuid        primary key default gen_random_uuid(),
  key        text        not null,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS signup_throttle_key_created_idx
  ON public.signup_throttle (key, created_at DESC);

ALTER TABLE public.signup_throttle ENABLE ROW LEVEL SECURITY;
-- No policies: only the service client (public signup action) touches this.
