-- Admin count aggregation RPCs.
--
-- The artists and campaigns admin list pages previously pulled *every* row of
-- assets/video_jobs/content_pieces into JS just to tally per-card counts — an
-- unbounded fetch that grows with the catalog. These functions push the GROUP BY
-- into Postgres so each page fetches one small aggregated row per artist/campaign
-- instead. The grouping columns are already indexed (see performance_indexes).
--
-- Both are STABLE, read-only, and SECURITY INVOKER — they are only ever called
-- through the service client (admin pages), so EXECUTE is revoked from anon /
-- authenticated to keep least privilege. Counts are cast to int so supabase-js
-- returns numbers rather than bigint strings.

-- ─────────────────────────────────────────────────────────────
-- admin_artist_counts — per-artist asset + video-job tallies for the
-- given artist ids. Returns only artists that have at least one asset or job;
-- the page defaults missing ids to 0.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_artist_counts(p_artist_ids uuid[])
RETURNS TABLE (artist_id uuid, asset_count int, job_count int)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(ac.artist_id, jc.artist_id) AS artist_id,
    COALESCE(ac.n, 0)::int               AS asset_count,
    COALESCE(jc.n, 0)::int               AS job_count
  FROM (
    SELECT artist_id, count(*) AS n
    FROM assets
    WHERE artist_id = ANY(p_artist_ids)
    GROUP BY artist_id
  ) ac
  FULL JOIN (
    SELECT artist_id, count(*) AS n
    FROM video_jobs
    WHERE artist_id = ANY(p_artist_ids)
    GROUP BY artist_id
  ) jc ON ac.artist_id = jc.artist_id;
$$;

-- ─────────────────────────────────────────────────────────────
-- admin_campaign_piece_counts — per-campaign total / approved / published
-- piece tallies across all campaigns.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION admin_campaign_piece_counts()
RETURNS TABLE (campaign_id uuid, total int, approved int, published int)
LANGUAGE sql
STABLE
AS $$
  SELECT
    campaign_id,
    count(*)::int                                          AS total,
    count(*) FILTER (WHERE status = 'approved')::int       AS approved,
    count(*) FILTER (WHERE status = 'published')::int      AS published
  FROM content_pieces
  GROUP BY campaign_id;
$$;

-- Restrict to the service role only. CREATE FUNCTION grants EXECUTE to PUBLIC by
-- default, and anon/authenticated inherit it through PUBLIC — so revoking those
-- roles individually is a no-op; the grant must be pulled from PUBLIC itself.
REVOKE EXECUTE ON FUNCTION admin_artist_counts(uuid[])   FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION admin_campaign_piece_counts() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION admin_artist_counts(uuid[])   TO service_role;
GRANT  EXECUTE ON FUNCTION admin_campaign_piece_counts() TO service_role;
