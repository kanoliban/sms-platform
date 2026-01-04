-- ============================================
-- WAITLIST TABLE
-- Tracks users waiting for spots in full rooms
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'expired', 'canceled')),
  invited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one waitlist entry per user per room
  UNIQUE(room_id, user_id)
);

-- Index for waitlist queries
CREATE INDEX IF NOT EXISTS idx_waitlist_room ON waitlist(room_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON waitlist(room_id, position);

-- ============================================
-- USER PREFERENCES
-- Stores user settings that persist across sessions
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the preferences structure
COMMENT ON COLUMN users.preferences IS 'User preferences JSON: { notifications: { email: bool, sms: bool, push: bool }, privacy: { showProfile: bool }, theme: string }';
