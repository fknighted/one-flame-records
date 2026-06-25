-- Enable RLS on bar_regulars so anon/authenticated keys cannot access it directly.
-- All app access goes through the service role (createServiceClient), which bypasses RLS.
ALTER TABLE bar_regulars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bar_regulars_service_role_only" ON bar_regulars
  FOR ALL
  USING (false)
  WITH CHECK (false);
