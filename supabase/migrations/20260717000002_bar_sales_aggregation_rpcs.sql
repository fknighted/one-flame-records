-- Bar sales aggregation RPCs.
--
-- The admin Sales page (/admin/bar/sales) computed every figure by pulling all
-- closed tabs and *every* line item of those tabs into JS, then reducing. For
-- "All Time" that scan is unbounded. These functions push the SUM/GROUP BY into
-- Postgres — one aggregated row set per section instead of thousands of rows.
--
-- Semantics mirror the previous JS exactly, including its quirks:
--   • Revenue = SUM(pos_tabs.total_cents) over closed tabs (NOT line-item price;
--     tip_cents is excluded, same as before).
--   • Cost of goods = SUM(cost_cents × quantity) over line items, cost snapshotted
--     at sale; a NULL cost counts as 0 (item sold as pure profit).
--   • Category defaults to 'other' when a line item has no pos_items row
--     (custom/ad-hoc charges).
--   • quantity defaults to 1 defensively (COALESCE), matching `quantity ?? 1`.
-- Cent sums are bigint: all-time revenue overflows int4 (~$214k JMD) quickly.
--
-- p_start is the period lower bound (inclusive) or NULL for all-time, matching
-- the page's periodStart(). All are STABLE, read-only, service_role-only
-- (the Sales page reads them through the service client). Joins are already
-- indexed by …0009 (pos_tab_items_tab_id_idx, pos_tabs_status_closed_at_idx).

-- ── Payment-method summary → revenue, tab count, and the payment split ────────
CREATE OR REPLACE FUNCTION bar_sales_payment_summary(p_start timestamptz)
RETURNS TABLE (payment_method text, tab_count int, revenue_cents bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(t.payment_method, 'unknown')   AS payment_method,
    COUNT(*)::int                           AS tab_count,
    SUM(COALESCE(t.total_cents, 0))::bigint  AS revenue_cents
  FROM pos_tabs t
  WHERE t.status = 'closed'
    AND (p_start IS NULL OR t.closed_at >= p_start)
  GROUP BY COALESCE(t.payment_method, 'unknown');
$$;

-- ── Revenue + cost by category → the By Category table + cost/items totals ────
CREATE OR REPLACE FUNCTION bar_sales_by_category(p_start timestamptz)
RETURNS TABLE (category text, qty bigint, revenue_cents bigint, cost_cents bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(pi.category, 'other')                                        AS category,
    SUM(COALESCE(ti.quantity, 1))::bigint                                 AS qty,
    SUM(COALESCE(ti.price_cents, 0) * COALESCE(ti.quantity, 1))::bigint   AS revenue_cents,
    SUM(COALESCE(ti.cost_cents, 0)  * COALESCE(ti.quantity, 1))::bigint   AS cost_cents
  FROM pos_tab_items ti
  JOIN pos_tabs t       ON t.id = ti.tab_id
  LEFT JOIN pos_items pi ON pi.id = ti.pos_item_id
  WHERE t.status = 'closed'
    AND (p_start IS NULL OR t.closed_at >= p_start)
  GROUP BY COALESCE(pi.category, 'other');
$$;

-- ── Top items by revenue → the Top Items table ───────────────────────────────
CREATE OR REPLACE FUNCTION bar_sales_top_items(p_start timestamptz, p_limit int DEFAULT 10)
RETURNS TABLE (name text, category text, qty bigint, revenue_cents bigint, cost_cents bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ti.name,
    MIN(COALESCE(pi.category, 'other'))                                   AS category,
    SUM(COALESCE(ti.quantity, 1))::bigint                                 AS qty,
    SUM(COALESCE(ti.price_cents, 0) * COALESCE(ti.quantity, 1))::bigint   AS revenue_cents,
    SUM(COALESCE(ti.cost_cents, 0)  * COALESCE(ti.quantity, 1))::bigint   AS cost_cents
  FROM pos_tab_items ti
  JOIN pos_tabs t       ON t.id = ti.tab_id
  LEFT JOIN pos_items pi ON pi.id = ti.pos_item_id
  WHERE t.status = 'closed'
    AND (p_start IS NULL OR t.closed_at >= p_start)
  GROUP BY ti.name
  ORDER BY revenue_cents DESC
  LIMIT p_limit;
$$;

REVOKE EXECUTE ON FUNCTION bar_sales_payment_summary(timestamptz)  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION bar_sales_by_category(timestamptz)      FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION bar_sales_top_items(timestamptz, int)   FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION bar_sales_payment_summary(timestamptz)  TO service_role;
GRANT  EXECUTE ON FUNCTION bar_sales_by_category(timestamptz)      TO service_role;
GRANT  EXECUTE ON FUNCTION bar_sales_top_items(timestamptz, int)   TO service_role;
