-- Migration 007: Rate Limits Table
-- Used for API rate limiting in serverless environment

-- Rate limits table for tracking request counts
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,  -- Composite key like 'otp:+15551234567' or 'invite:user-uuid'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups by key and time
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_created ON rate_limits(key, created_at DESC);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_created ON rate_limits(created_at);

-- Enable RLS (only accessible via service role for cron/API)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: No public access (only service role can access)
CREATE POLICY "Service role only" ON rate_limits
  FOR ALL
  USING (false);
