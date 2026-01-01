-- SMS Platform Initial Schema
-- Version: 1.0
-- Description: Core tables for rooms, users, invitations, feedback, and trust

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Both hosts and guests
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'host', 'founder')),

  -- Intent filter (shark detection)
  intent TEXT CHECK (intent IN ('human_connection', 'professional', 'curious', 'referred')),

  -- Tone preference
  tone_preference TEXT CHECK (tone_preference IN ('chill', 'playful', 'deep', 'intense')),

  -- Trust score components
  trust_score_overall INTEGER DEFAULT 50 CHECK (trust_score_overall >= 0 AND trust_score_overall <= 100),
  trust_reliability INTEGER DEFAULT 50 CHECK (trust_reliability >= 0 AND trust_reliability <= 100),
  trust_social INTEGER DEFAULT 50 CHECK (trust_social >= 0 AND trust_social <= 100),
  trust_safety INTEGER DEFAULT 50 CHECK (trust_safety >= 0 AND trust_safety <= 100),
  trust_tenure INTEGER DEFAULT 0 CHECK (trust_tenure >= 0),
  trust_status TEXT DEFAULT 'new' CHECK (trust_status IN ('new', 'active', 'suspended', 'banned')),

  -- Stats
  rooms_attended INTEGER DEFAULT 0,
  rooms_hosted INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for phone lookups (primary identifier)
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_trust_status ON users(trust_status);

-- ============================================
-- ROOMS TABLE
-- Gatherings hosted by users
-- ============================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basics
  name TEXT NOT NULL,
  description TEXT,
  tone TEXT CHECK (tone IN ('chill', 'playful', 'deep', 'intense')),

  -- Logistics
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  location_address TEXT NOT NULL,
  location_hint TEXT, -- Shown before reveal (e.g., "Northeast Minneapolis")
  capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 50),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),

  -- State
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'full', 'confirmed', 'in_progress', 'completed', 'canceled')),

  -- Flags
  location_revealed BOOLEAN DEFAULT FALSE,
  feedback_requested BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for room queries
CREATE INDEX idx_rooms_host ON rooms(host_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_date ON rooms(date);

-- ============================================
-- INVITATIONS TABLE
-- Links users to rooms with payment info
-- ============================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- State
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'declined', 'expired', 'canceled')),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  -- Payment (Stripe)
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER,
  captured BOOLEAN DEFAULT FALSE,
  captured_at TIMESTAMPTZ,

  -- Attendance
  attended BOOLEAN,
  marked_at TIMESTAMPTZ,

  -- Unique constraint: one invitation per user per room
  UNIQUE(room_id, user_id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for invitation queries
CREATE INDEX idx_invitations_room ON invitations(room_id);
CREATE INDEX idx_invitations_user ON invitations(user_id);
CREATE INDEX idx_invitations_status ON invitations(status);

-- ============================================
-- FEEDBACK TABLE
-- Post-room feedback from guests and hosts
-- ============================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('guest', 'host')),

  -- Guest feedback
  felt_different TEXT CHECK (felt_different IN ('much', 'somewhat', 'not_really')),
  shared_something TEXT CHECK (shared_something IN ('yes', 'a_little', 'no')),
  agreements_followed TEXT CHECK (agreements_followed IN ('completely', 'mostly', 'issues')),
  issues TEXT,
  attend_again TEXT CHECK (attend_again IN ('definitely', 'maybe', 'no')),
  uncomfortable TEXT,

  -- Host feedback
  felt_like_sms TEXT CHECK (felt_like_sms IN ('yes', 'mostly', 'not_quite')),
  prompts_helped TEXT CHECK (prompts_helped IN ('very', 'somewhat', 'not_really', 'didnt_use')),
  difficult_guests TEXT,
  exceptional_guests TEXT,
  what_would_help TEXT,

  -- Unique constraint: one feedback per user per room
  UNIQUE(room_id, user_id),

  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for feedback queries
CREATE INDEX idx_feedback_room ON feedback(room_id);

-- ============================================
-- TRUST EVENTS TABLE
-- Audit log for trust score changes
-- ============================================
CREATE TABLE trust_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  delta INTEGER NOT NULL,
  new_score INTEGER,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for trust event queries
CREATE INDEX idx_trust_events_user ON trust_events(user_id);
CREATE INDEX idx_trust_events_type ON trust_events(event_type);

-- ============================================
-- HOST PROMPTS TABLE
-- Pocket Liban - scheduled prompts for hosts
-- ============================================
CREATE TABLE host_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('pre_room', 'opening', 'check_in', 'energy_check', 'closing_warning', 'closing')),
  message TEXT NOT NULL,
  send_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for prompt scheduling
CREATE INDEX idx_host_prompts_send_at ON host_prompts(send_at) WHERE sent = FALSE;
CREATE INDEX idx_host_prompts_room ON host_prompts(room_id);

-- ============================================
-- SMS CONVERSATION STATE TABLE
-- Tracks multi-turn SMS conversations
-- ============================================
CREATE TABLE sms_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context TEXT NOT NULL, -- 'invitation', 'feedback_guest', 'feedback_host', 'onboarding'
  context_id UUID, -- room_id or invitation_id depending on context
  state TEXT NOT NULL DEFAULT 'initial',
  data JSONB DEFAULT '{}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for conversation lookups
CREATE INDEX idx_sms_conversations_user ON sms_conversations(user_id);
CREATE INDEX idx_sms_conversations_active ON sms_conversations(user_id, context) WHERE expires_at > NOW();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sms_conversations_updated_at
  BEFORE UPDATE ON sms_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to calculate overall trust score from components
CREATE OR REPLACE FUNCTION calculate_trust_score(
  reliability INTEGER,
  social INTEGER,
  safety INTEGER,
  tenure INTEGER
) RETURNS INTEGER AS $$
BEGIN
  -- Weights: reliability 35%, social 25%, safety 30%, tenure 10%
  RETURN LEAST(100, GREATEST(0,
    (reliability * 0.35 + social * 0.25 + safety * 0.30 + LEAST(tenure, 100) * 0.10)::INTEGER
  ));
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate user's overall trust score
CREATE OR REPLACE FUNCTION recalculate_user_trust(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET trust_score_overall = calculate_trust_score(
    trust_reliability,
    trust_social,
    trust_safety,
    trust_tenure
  )
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;
