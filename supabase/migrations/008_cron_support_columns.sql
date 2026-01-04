-- SMS Platform Migration: Add columns for cron job support
-- Version: 8.0
-- Description: Adds columns needed by automated cron jobs (waitlist, feedback, payment retry)

-- ============================================
-- INVITATIONS TABLE UPDATES
-- ============================================

-- Feedback tracking
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS feedback_requested BOOLEAN DEFAULT FALSE;

-- Waitlist support
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS promoted_from_waitlist BOOLEAN DEFAULT FALSE;

ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ;

-- Payment retry tracking
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS capture_attempts INTEGER DEFAULT 0;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index for waitlist queries (find waitlisted users ordered by position)
CREATE INDEX IF NOT EXISTS idx_invitations_waitlist
ON invitations(space_id, waitlist_position)
WHERE status = 'waitlisted';

-- Index for feedback nudge queries (find guests who haven't been asked)
CREATE INDEX IF NOT EXISTS idx_invitations_feedback
ON invitations(space_id, feedback_requested)
WHERE status = 'accepted' AND attended = TRUE;

-- Index for payment retry queries (find failed captures)
CREATE INDEX IF NOT EXISTS idx_invitations_capture_retry
ON invitations(capture_attempts)
WHERE captured = FALSE AND stripe_payment_intent_id IS NOT NULL;

-- ============================================
-- ADD WAITLISTED STATUS IF NOT EXISTS
-- ============================================

-- Update the status check constraint to include 'waitlisted'
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_status_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_status_check
CHECK (status IN ('pending', 'sent', 'accepted', 'declined', 'canceled', 'waitlisted'));
