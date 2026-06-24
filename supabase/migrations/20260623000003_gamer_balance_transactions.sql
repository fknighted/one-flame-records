CREATE TABLE gamer_balance_transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     uuid NOT NULL REFERENCES gamer_members(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('topup', 'session', 'adjustment', 'correction')),
  amount_minutes integer NOT NULL,  -- positive = credit, negative = debit
  reason        text,
  created_by    uuid REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_gbt_member_id ON gamer_balance_transactions(member_id);
CREATE INDEX idx_gbt_created_at ON gamer_balance_transactions(created_at DESC);
