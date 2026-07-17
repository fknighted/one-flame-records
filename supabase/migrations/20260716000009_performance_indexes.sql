-- Performance: index the foreign-key and filter columns that hot queries scan.
--
-- Postgres does NOT auto-index foreign keys. Across the prior 40 migrations only
-- 4 indexes existed, so every join/filter below was a sequential scan that gets
-- slower as tabs, line items, and the catalog grow. These are all additive and
-- safe to apply before the dependent code (there is no dependent code — indexes
-- only speed existing queries).

-- Bar: the single hottest join — every profit/COGS aggregation does
-- pos_tab_items.in('tab_id', …) and the sales/overview/inventory pages sum them.
CREATE INDEX IF NOT EXISTS pos_tab_items_tab_id_idx ON public.pos_tab_items (tab_id);

-- Bar tabs: status filters (open/away lists, closed sales), closed_at ranges,
-- created_at "today" ranges. Composite covers the sales query's status+closed_at.
CREATE INDEX IF NOT EXISTS pos_tabs_status_closed_at_idx ON public.pos_tabs (status, closed_at DESC);
CREATE INDEX IF NOT EXISTS pos_tabs_created_at_idx       ON public.pos_tabs (created_at DESC);

-- Gaming: active-session lookup (ended_at IS NULL) and per-member history.
CREATE INDEX IF NOT EXISTS game_sessions_active_idx    ON public.game_sessions (started_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS game_sessions_member_id_idx ON public.game_sessions (member_id, ended_at DESC);

-- Catalog / portal: every artist page and admin count filters by artist_id.
CREATE INDEX IF NOT EXISTS assets_artist_id_idx     ON public.assets (artist_id);
CREATE INDEX IF NOT EXISTS releases_artist_id_idx    ON public.releases (artist_id);
CREATE INDEX IF NOT EXISTS videos_artist_id_idx      ON public.videos (artist_id);
CREATE INDEX IF NOT EXISTS video_jobs_artist_id_idx  ON public.video_jobs (artist_id);

-- Public video wall / dashboard: public+complete jobs, and status dashboards.
CREATE INDEX IF NOT EXISTS video_jobs_public_idx ON public.video_jobs (created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS video_jobs_status_idx ON public.video_jobs (status);

-- Campaigns: per-campaign piece counts.
CREATE INDEX IF NOT EXISTS content_pieces_campaign_id_idx ON public.content_pieces (campaign_id);
