BEGIN;
-- Public account creation never chooses its own privileges. Staff invitations
-- assign their role explicitly through the already-authorized service action.
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles(id, role) VALUES (new.id, 'artist');
  RETURN new;
END; $$;

-- An enrolled administrator must complete the second step, including direct
-- database requests. Existing admins without a factor can still enroll.
CREATE OR REPLACE FUNCTION public.has_required_second_factor() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT COALESCE(auth.jwt()->>'aal' = 'aal2', false)
 OR NOT EXISTS (SELECT 1 FROM auth.mfa_factors WHERE user_id = auth.uid() AND status = 'verified');
$$;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
 AND public.has_required_second_factor();
$$;

CREATE OR REPLACE FUNCTION public.is_bar_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id=auth.uid() AND
  ((role='admin' AND public.has_required_second_factor()) OR role='bartender' OR (role='artist' AND is_bartender)));
$$;
-- Direct writes bypass whole business operations. Browser sessions read via
-- policies; validated service actions own all bar and asset writes.
REVOKE INSERT,UPDATE,DELETE ON public.pos_tabs,public.pos_tab_items,public.pos_items,
 public.game_sessions,public.gamer_members,public.assets FROM PUBLIC,anon,authenticated;

-- Rows and columns are separate permissions. Never expose legal identities
-- through the public artist API (including other artists' authenticated calls).
REVOKE SELECT ON public.artists FROM anon, authenticated;
REVOKE SELECT(legal_name) ON public.artists FROM anon, authenticated;
GRANT SELECT(id, slug, stage_name, bio, photo_url, hometown, genres, socials,
 streaming, status, featured_order, created_at, updated_at)
 ON public.artists TO anon, authenticated;

-- Revoke explicit Supabase default grants as well as inherited PUBLIC grants.
DO $$ DECLARE fn record; BEGIN
 FOR fn IN SELECT p.oid::regprocedure AS signature FROM pg_proc p
 JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
 AND p.proname IN ('increment_tab_total','decrement_tab_total',
 'increment_tab_item_quantity','decrement_tab_item_quantity',
 'decrement_pos_item_stock','decrement_pos_item_stock_by',
 'increment_pos_item_stock_by','add_pos_item_stock','adjust_member_minutes',
 'admin_artist_counts','admin_campaign_piece_counts','bar_sales_payment_summary',
 'bar_sales_by_category','bar_sales_top_items')
 LOOP
  EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.signature);
  EXECUTE format('ALTER FUNCTION %s SET search_path = public', fn.signature);
 END LOOP;
END $$;

-- Public forms must use the validated/rate-limited application boundary.
DROP POLICY IF EXISTS signup_applications_insert_public ON public.signup_applications;
DROP POLICY IF EXISTS subscribers_insert_public ON public.fan_subscribers;

UPDATE storage.buckets SET file_size_limit = 104857600,
 allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-wav']
 WHERE id='public-media';
UPDATE storage.buckets SET file_size_limit = 10485760,
 allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-wav']
 WHERE id='private-assets';
UPDATE storage.buckets SET file_size_limit = 104857600, allowed_mime_types=ARRAY['video/mp4'] WHERE id='generated-videos';
COMMIT;
