-- User Onboarding Support
-- Adds columns to track onboarding completion and user intent

-- Add onboarding_completed column (defaults to true for existing users)
ALTER TABLE users
ADD COLUMN onboarding_completed BOOLEAN DEFAULT TRUE;

-- Add user_intent column for tracking what users want to do with SMS
-- Using TEXT with CHECK constraint to allow: 'attend', 'host', 'both'
ALTER TABLE users
ADD COLUMN user_intent TEXT CHECK (user_intent IN ('attend', 'host', 'both'));

-- Update existing users to have onboarding_completed = true
-- (They were already using the platform before this feature)
UPDATE users SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;

-- For new users created after this migration, we want onboarding_completed = false
-- This is handled in the API, but we'll change the default for safety
ALTER TABLE users
ALTER COLUMN onboarding_completed SET DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN users.onboarding_completed IS 'Whether the user has completed the post-registration onboarding flow';
COMMENT ON COLUMN users.user_intent IS 'User intent selected during onboarding: attend, host, or both';

-- Index for querying users who haven't completed onboarding (for metrics)
CREATE INDEX idx_users_onboarding ON users(onboarding_completed) WHERE onboarding_completed = FALSE;
