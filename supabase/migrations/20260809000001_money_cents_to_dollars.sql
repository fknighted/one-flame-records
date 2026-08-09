-- Money: cents → whole JMD dollars.
--
-- Owner decision 2026-08-09 (docs/decisions.md). No price, cost, or tip in this
-- business is ever a fraction of a dollar, so every `_cents` column stored two
-- digits that were always `00` and every read/write paid a ×100 / ÷100 tax.
-- This converts all 11 money columns across 5 tables to whole dollars and
-- rewrites the 6 money-carrying RPCs to match.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- RUN THIS WITH THE BAR CLOSED.
--
-- The application deploy and this migration are separate steps. Between them
-- the schema and the code disagree, so any tab opened or item rung up in that
-- window would be recorded at 100× or 1/100× the true amount. Apply the
-- migration and deploy the matching build back to back while no one is selling.
--
-- Back up before running (CLAUDE.md: never deploy a destructive migration to
-- production without backing up first). This migration is DESTRUCTIVE: it
-- renames each column and rewrites its values in place (÷100). There is no
-- copy of the original cents values afterwards, so a backup is the only way
-- back.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Safety: step 1 aborts the whole migration if any stored value is not a whole
-- number of dollars. That is a live possibility, not a formality —
-- CustomItemForm allowed `step="0.01"`, so a custom item rung up at $250.50 is
-- stored as 25050. If this raises, STOP: real sub-dollar sales exist and the
-- rounding rule is an owner decision, not something to assume. See
-- scripts/audit-money-precision.mjs to inspect the offending rows first.

-- ─────────────────────────────────────────────────────────────
-- 1. Pre-flight: refuse to run if any value has sub-dollar precision
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_bad     bigint := 0;
  v_report  text   := '';
  r         record;
BEGIN
  FOR r IN
    SELECT 'pos_items.price_cents'                AS col, COUNT(*) AS n FROM pos_items            WHERE price_cents          % 100 <> 0
    UNION ALL SELECT 'pos_items.cost_cents',                COUNT(*) FROM pos_items               WHERE cost_cents           % 100 <> 0
    UNION ALL SELECT 'pos_tab_items.price_cents',           COUNT(*) FROM pos_tab_items           WHERE price_cents          % 100 <> 0
    UNION ALL SELECT 'pos_tab_items.cost_cents',            COUNT(*) FROM pos_tab_items           WHERE cost_cents           % 100 <> 0
    UNION ALL SELECT 'pos_tabs.total_cents',                COUNT(*) FROM pos_tabs                WHERE total_cents          % 100 <> 0
    UNION ALL SELECT 'pos_tabs.tip_cents',                  COUNT(*) FROM pos_tabs                WHERE tip_cents            % 100 <> 0
    UNION ALL SELECT 'pos_stock_purchases.unit_cost_cents', COUNT(*) FROM pos_stock_purchases     WHERE unit_cost_cents      % 100 <> 0
    UNION ALL SELECT 'pos_stock_purchases.total_cost_cents',COUNT(*) FROM pos_stock_purchases     WHERE total_cost_cents     % 100 <> 0
    UNION ALL SELECT 'pos_stock_purchases.container_cost_cents', COUNT(*) FROM pos_stock_purchases WHERE container_cost_cents % 100 <> 0
    UNION ALL SELECT 'pos_voids.price_cents',               COUNT(*) FROM pos_voids               WHERE price_cents          % 100 <> 0
    UNION ALL SELECT 'pos_voids.cost_cents',                COUNT(*) FROM pos_voids               WHERE cost_cents           % 100 <> 0
  LOOP
    IF r.n > 0 THEN
      v_bad    := v_bad + r.n;
      v_report := v_report || format('  %s: %s row(s)%s', r.col, r.n, chr(10));
    END IF;
  END LOOP;

  IF v_bad > 0 THEN
    RAISE EXCEPTION
      'Sub-dollar money found — migration aborted, nothing changed.%s%sTotal: % row(s) are not whole dollars.%sDecide the rounding rule with the owner before converting; do not truncate real sales.%sInspect with: node scripts/audit-money-precision.mjs',
      chr(10), v_report, v_bad, chr(10), chr(10);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. Rename the columns, then divide.
--    Inline CHECK constraints (>= 0) follow their column automatically.
--    game_sessions.price_jmd is already dollars and is deliberately untouched.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.pos_items           RENAME COLUMN price_cents          TO price_jmd;
ALTER TABLE public.pos_items           RENAME COLUMN cost_cents           TO cost_jmd;
ALTER TABLE public.pos_tab_items       RENAME COLUMN price_cents          TO price_jmd;
ALTER TABLE public.pos_tab_items       RENAME COLUMN cost_cents           TO cost_jmd;
ALTER TABLE public.pos_tabs            RENAME COLUMN total_cents          TO total_jmd;
ALTER TABLE public.pos_tabs            RENAME COLUMN tip_cents            TO tip_jmd;
ALTER TABLE public.pos_stock_purchases RENAME COLUMN unit_cost_cents      TO unit_cost_jmd;
ALTER TABLE public.pos_stock_purchases RENAME COLUMN total_cost_cents     TO total_cost_jmd;
ALTER TABLE public.pos_stock_purchases RENAME COLUMN container_cost_cents TO container_cost_jmd;
ALTER TABLE public.pos_voids           RENAME COLUMN price_cents          TO price_jmd;
ALTER TABLE public.pos_voids           RENAME COLUMN cost_cents           TO cost_jmd;

-- Integer division is exact here: step 1 proved every value is divisible by 100.
UPDATE public.pos_items
  SET price_jmd = price_jmd / 100,
      cost_jmd  = cost_jmd  / 100;

UPDATE public.pos_tab_items
  SET price_jmd = price_jmd / 100,
      cost_jmd  = cost_jmd  / 100;

UPDATE public.pos_tabs
  SET total_jmd = total_jmd / 100,
      tip_jmd   = tip_jmd   / 100;

UPDATE public.pos_stock_purchases
  SET unit_cost_jmd      = unit_cost_jmd      / 100,
      total_cost_jmd     = total_cost_jmd     / 100,
      container_cost_jmd = container_cost_jmd / 100;

UPDATE public.pos_voids
  SET price_jmd = price_jmd / 100,
      cost_jmd  = cost_jmd  / 100;

-- ─────────────────────────────────────────────────────────────
-- 3. Tab-total RPCs. Signatures are unchanged; p_amount is now dollars.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_tab_total(p_tab_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE pos_tabs
  SET total_jmd = total_jmd + p_amount
  WHERE id = p_tab_id AND status = 'open';
$$;

CREATE OR REPLACE FUNCTION decrement_tab_total(p_tab_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE pos_tabs
  SET total_jmd = GREATEST(0, total_jmd - p_amount)
  WHERE id = p_tab_id AND status = 'open';
$$;

-- ─────────────────────────────────────────────────────────────
-- 4. add_pos_item_stock — parameter renamed, so DROP + CREATE
--    (CREATE OR REPLACE cannot rename an input parameter).
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS add_pos_item_stock(uuid, int, int);

CREATE FUNCTION add_pos_item_stock(
  p_item_id      uuid,
  p_qty          int,
  p_unit_cost_jmd int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_stock int;
BEGIN
  IF p_qty IS NULL OR p_qty <= 0 THEN
    RAISE EXCEPTION 'add_pos_item_stock: quantity must be positive (got %)', p_qty;
  END IF;

  UPDATE pos_items
  SET stock_quantity = COALESCE(stock_quantity, 0) + p_qty,
      cost_jmd       = COALESCE(p_unit_cost_jmd, cost_jmd),
      updated_at     = now()
  WHERE id = p_item_id
  RETURNING stock_quantity INTO v_new_stock;

  IF v_new_stock IS NULL THEN
    RAISE EXCEPTION 'add_pos_item_stock: item % not found', p_item_id;
  END IF;

  RETURN v_new_stock;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Sales aggregation RPCs — returned column names change, so DROP + CREATE.
--    Semantics are unchanged from …0717000002; only the unit is different.
--    Sums stay bigint: cheap, and it keeps headroom regardless of unit.
-- ─────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS bar_sales_payment_summary(timestamptz);
DROP FUNCTION IF EXISTS bar_sales_by_category(timestamptz);
DROP FUNCTION IF EXISTS bar_sales_top_items(timestamptz, int);

CREATE FUNCTION bar_sales_payment_summary(p_start timestamptz)
RETURNS TABLE (payment_method text, tab_count int, revenue_jmd bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(t.payment_method, 'unknown')  AS payment_method,
    COUNT(*)::int                          AS tab_count,
    SUM(COALESCE(t.total_jmd, 0))::bigint  AS revenue_jmd
  FROM pos_tabs t
  WHERE t.status = 'closed'
    AND (p_start IS NULL OR t.closed_at >= p_start)
  GROUP BY COALESCE(t.payment_method, 'unknown');
$$;

CREATE FUNCTION bar_sales_by_category(p_start timestamptz)
RETURNS TABLE (category text, qty bigint, revenue_jmd bigint, cost_jmd bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(pi.category, 'other')                                      AS category,
    SUM(COALESCE(ti.quantity, 1))::bigint                               AS qty,
    SUM(COALESCE(ti.price_jmd, 0) * COALESCE(ti.quantity, 1))::bigint   AS revenue_jmd,
    SUM(COALESCE(ti.cost_jmd, 0)  * COALESCE(ti.quantity, 1))::bigint   AS cost_jmd
  FROM pos_tab_items ti
  JOIN pos_tabs t        ON t.id = ti.tab_id
  LEFT JOIN pos_items pi ON pi.id = ti.pos_item_id
  WHERE t.status = 'closed'
    AND (p_start IS NULL OR t.closed_at >= p_start)
  GROUP BY COALESCE(pi.category, 'other');
$$;

CREATE FUNCTION bar_sales_top_items(p_start timestamptz, p_limit int DEFAULT 10)
RETURNS TABLE (name text, category text, qty bigint, revenue_jmd bigint, cost_jmd bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ti.name,
    MIN(COALESCE(pi.category, 'other'))                                 AS category,
    SUM(COALESCE(ti.quantity, 1))::bigint                               AS qty,
    SUM(COALESCE(ti.price_jmd, 0) * COALESCE(ti.quantity, 1))::bigint   AS revenue_jmd,
    SUM(COALESCE(ti.cost_jmd, 0)  * COALESCE(ti.quantity, 1))::bigint   AS cost_jmd
  FROM pos_tab_items ti
  JOIN pos_tabs t        ON t.id = ti.tab_id
  LEFT JOIN pos_items pi ON pi.id = ti.pos_item_id
  WHERE t.status = 'closed'
    AND (p_start IS NULL OR t.closed_at >= p_start)
  GROUP BY ti.name
  ORDER BY revenue_jmd DESC
  LIMIT p_limit;
$$;

REVOKE EXECUTE ON FUNCTION bar_sales_payment_summary(timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION bar_sales_by_category(timestamptz)     FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION bar_sales_top_items(timestamptz, int)  FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION bar_sales_payment_summary(timestamptz) TO service_role;
GRANT  EXECUTE ON FUNCTION bar_sales_by_category(timestamptz)     TO service_role;
GRANT  EXECUTE ON FUNCTION bar_sales_top_items(timestamptz, int)  TO service_role;
