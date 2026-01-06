-- Migration: Trust System
-- Description: Add trust_events audit table and force_logout_at column for founder trust actions

-- ============================================================
-- Trust Events Audit Table
-- Logs all founder trust actions (suspend, ban, reinstate)
-- ============================================================
CREATE TABLE IF NOT EXISTS trust_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('suspend', 'ban', 'reinstate')),
  reason TEXT,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_trust_events_user_id ON trust_events(user_id);

-- Index for audit queries by performer
CREATE INDEX IF NOT EXISTS idx_trust_events_performed_by ON trust_events(performed_by);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_trust_events_performed_at ON trust_events(performed_at DESC);

-- ============================================================
-- Force Logout Column
-- When set, any JWT issued before this timestamp is invalid
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS force_logout_at TIMESTAMPTZ;

-- ============================================================
-- RLS Policies for trust_events
-- ============================================================
ALTER TABLE trust_events ENABLE ROW LEVEL SECURITY;

-- Only founders can read trust events
CREATE POLICY "Founders can read all trust events"
  ON trust_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'founder'
    )
  );

-- Only founders can insert trust events (via API with service role)
-- This is enforced at the API level, not RLS, since we use admin client
CREATE POLICY "Service role can insert trust events"
  ON trust_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON TABLE trust_events IS 'Audit log of all founder trust actions on users';
COMMENT ON COLUMN trust_events.action IS 'suspend, ban, or reinstate';
COMMENT ON COLUMN trust_events.reason IS 'Founder-provided reason for the action';
COMMENT ON COLUMN trust_events.previous_status IS 'User trust_status before the action';
COMMENT ON COLUMN trust_events.new_status IS 'User trust_status after the action';
COMMENT ON COLUMN users.force_logout_at IS 'When set, any JWT issued before this timestamp is invalid';
