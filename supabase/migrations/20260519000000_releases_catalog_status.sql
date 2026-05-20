-- Add catalog number and production workflow status to releases.
-- catalog_no: nullable, admin fills manually (e.g. OFR-021). Existing rows stay null.
-- production_status: not-null default 'live' so all existing rows surface in the Live tile.
ALTER TABLE releases
  ADD COLUMN IF NOT EXISTS catalog_no text,
  ADD COLUMN IF NOT EXISTS production_status text NOT NULL DEFAULT 'live';
