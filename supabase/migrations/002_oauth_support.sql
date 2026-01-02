-- Add OAuth support to users table
-- Allows users to sign in with Google OAuth

-- Add auth_id column to link to Supabase Auth
ALTER TABLE users ADD COLUMN auth_id UUID UNIQUE;

-- Add avatar_url for OAuth profile pictures
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Make phone nullable for OAuth users (they may not have a phone)
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Add unique constraint on email for OAuth lookups
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Add index for auth_id lookups
CREATE INDEX idx_users_auth_id ON users(auth_id) WHERE auth_id IS NOT NULL;

-- Update constraint: require either phone or auth_id
ALTER TABLE users ADD CONSTRAINT users_identity_required
  CHECK (phone IS NOT NULL OR auth_id IS NOT NULL);
