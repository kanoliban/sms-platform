-- Migration: Host Applications with Legal Agreement Tracking
-- Purpose: Create tables for host application flow with e-sign compliance

-- ============================================================================
-- HOST TERMS VERSIONS
-- Immutable record of what hosts agreed to (version control for legal)
-- ============================================================================

CREATE TABLE IF NOT EXISTS host_terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL UNIQUE,      -- 'v1.0.0', 'v1.1.0', etc.
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,                     -- Full legal text (markdown)
  summary TEXT,                              -- Brief summary for display
  effective_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,            -- Only one should be active
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one active version at a time
CREATE UNIQUE INDEX idx_host_terms_active ON host_terms_versions(is_active) WHERE is_active = TRUE;

-- Insert initial host terms version
INSERT INTO host_terms_versions (version, title, content, summary, effective_date, is_active)
VALUES (
  'v1.0.0',
  'SMS Host Agreement',
  E'# SMS Host Agreement\n\n**Version 1.0 | Effective January 2026**\n\nBy signing below, you ("Host") agree to the following terms when hosting spaces through Strangers Meeting Strangers ("SMS", "Platform", "we", "us").\n\n## 1. Hosting Responsibilities\n\n### 1.1 Safety & Environment\n- You will maintain a safe, respectful environment for all guests\n- You will not discriminate against guests based on race, gender, religion, sexual orientation, disability, or other protected characteristics\n- You will respond promptly to any safety concerns raised by guests\n- You will not host spaces while impaired by alcohol or other substances\n\n### 1.2 Accurate Representation\n- All information you provide about your spaces (location, capacity, amenities, rules) will be accurate and not misleading\n- You will promptly update any information that changes\n- Photos and descriptions will accurately represent the experience\n\n### 1.3 Attendance & Reliability\n- You will arrive at least 15 minutes before your stated start time\n- You will not cancel spaces less than 24 hours before without extenuating circumstances\n- You will communicate promptly if any changes are necessary\n\n## 2. Guest Data & Privacy\n\n### 2.1 Data Use\n- You may only use guest information for purposes related to the space\n- You will not share guest contact information with third parties\n- You will not contact guests outside the platform for unrelated purposes\n\n### 2.2 Confidentiality\n- Conversations and experiences within spaces are confidential\n- You will not record audio or video without explicit consent from all guests\n\n## 3. Financial Terms\n\n### 3.1 Platform Fees\n- SMS retains a platform fee from each paid space (currently 10%)\n- Fees are automatically deducted before payout\n\n### 3.2 Payment Flow\n- Guest payments are authorized at RSVP, captured after attendance\n- No-shows are not charged; their trust score is affected\n- You will not collect payments from guests outside the platform\n\n### 3.3 Refunds & Cancellations\n- If you cancel a space, guests receive full refunds\n- If guests cancel per your cancellation policy, you may retain partial payment\n- Disputes will be resolved per SMS''s dispute resolution policy\n\n## 4. Platform Relationship\n\n### 4.1 Independent Contractor\n- You are an independent host, not an employee or agent of SMS\n- SMS does not control how you host, only that you meet platform standards\n\n### 4.2 Revocation Rights\n- SMS may suspend or revoke your hosting privileges at any time if:\n  - You violate these terms or community guidelines\n  - Guest complaints indicate safety or quality concerns\n  - You engage in illegal activity\n  - Your trust score falls below acceptable levels\n\n### 4.3 Indemnification\n- You agree to indemnify SMS against claims arising from your spaces, your actions, or violations of these terms\n\n## 5. Representations\n\nBy signing, you represent that:\n- You are at least 18 years old\n- You have legal authority to host at the locations you specify\n- You are not prohibited from hosting events in your jurisdiction\n- All information you have provided is true and accurate\n\n## 6. Agreement\n\nThis agreement is governed by the laws of Minnesota, USA. By typing your name below, you acknowledge you have read, understand, and agree to all terms in this Host Agreement.',
  'By becoming an SMS host, you agree to maintain safe spaces, respect guest privacy, honor financial commitments, and uphold community standards. SMS may revoke hosting privileges for violations.',
  NOW(),
  TRUE
);

-- ============================================================================
-- HOST APPLICATIONS
-- The legal record of host agreement with e-sign compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS host_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What they agreed to
  terms_version_id UUID NOT NULL REFERENCES host_terms_versions(id),

  -- E-Sign Act compliance fields
  signature_name VARCHAR(255) NOT NULL,       -- Typed name (their signature)
  signature_timestamp TIMESTAMPTZ NOT NULL,   -- When they signed
  signature_ip VARCHAR(50),                   -- IP address at signing
  signature_user_agent TEXT,                  -- Browser/device info

  -- Application status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- 'pending' = awaiting review
    -- 'approved' = accepted as host
    -- 'rejected' = declined
    -- 'revoked' = was approved, now revoked

  -- Review tracking
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,                          -- Internal notes (not shown to user)
  rejection_reason TEXT,                      -- Shown to user if rejected

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_terms UNIQUE(user_id, terms_version_id)
);

-- Indexes for common queries
CREATE INDEX idx_host_applications_status ON host_applications(status);
CREATE INDEX idx_host_applications_user ON host_applications(user_id);
CREATE INDEX idx_host_applications_created ON host_applications(created_at DESC);

-- ============================================================================
-- UPDATE USERS TABLE
-- Add application_status for quick checks
-- ============================================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS host_application_status VARCHAR(20);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE host_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can read active terms
CREATE POLICY "Anyone can read active host terms"
  ON host_terms_versions FOR SELECT
  USING (is_active = TRUE);

-- Users can read their own applications
CREATE POLICY "Users can read own applications"
  ON host_applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create own applications"
  ON host_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Founders can read all applications
CREATE POLICY "Founders can read all applications"
  ON host_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- Founders can update applications (approve/reject)
CREATE POLICY "Founders can update applications"
  ON host_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

-- ============================================================================
-- TRIGGER: Update user role on application approval
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_host_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's host_application_status
  UPDATE users
  SET host_application_status = NEW.status,
      updated_at = NOW()
  WHERE id = NEW.user_id;

  -- If approved, also update role to 'host'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE users
    SET role = 'host',
        updated_at = NOW()
    WHERE id = NEW.user_id AND role = 'guest';
  END IF;

  -- If revoked, downgrade back to guest
  IF NEW.status = 'revoked' AND OLD.status = 'approved' THEN
    UPDATE users
    SET role = 'guest',
        updated_at = NOW()
    WHERE id = NEW.user_id AND role = 'host';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_host_application_status_change
  AFTER INSERT OR UPDATE OF status ON host_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_host_application_status_change();
