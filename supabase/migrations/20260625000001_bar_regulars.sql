CREATE TABLE bar_regulars (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  phone      text,
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bar_regulars_name ON bar_regulars(lower(name));

ALTER TABLE pos_tabs ADD COLUMN IF NOT EXISTS regular_id uuid REFERENCES bar_regulars(id) ON DELETE SET NULL;
