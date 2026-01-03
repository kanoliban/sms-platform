-- Migration: Add blasts and notifications tables
-- Created: 2026-01-03

-- Blasts table: Store SMS blasts sent to guests
CREATE TABLE IF NOT EXISTS blasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  sent_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  recipient_filter TEXT NOT NULL DEFAULT 'all', -- 'all', 'confirmed', 'invited'
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying blasts by space
CREATE INDEX IF NOT EXISTS idx_blasts_space_id ON blasts(space_id);
CREATE INDEX IF NOT EXISTS idx_blasts_sent_at ON blasts(sent_at DESC);

-- Notifications table: Store user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'reminder', 'update', 'invite', 'location_reveal', 'registration', 'payment'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- who triggered the notification
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE blasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Blasts policies: hosts can view/create for their spaces
CREATE POLICY "Hosts can view blasts for their spaces"
  ON blasts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = blasts.space_id
      AND spaces.host_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can create blasts for their spaces"
  ON blasts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = space_id
      AND spaces.host_id = auth.uid()
    )
  );

-- Notifications policies: users can view/update their own
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can do everything (for API routes)
CREATE POLICY "Service role can manage blasts"
  ON blasts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
