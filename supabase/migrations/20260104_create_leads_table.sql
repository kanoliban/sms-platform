-- Create leads table for unified lead management
-- Replaces Notion-based lead capture with internal system

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Lead type
  type TEXT NOT NULL CHECK (type IN ('host', 'attendee')),

  -- Contact info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,

  -- Host-specific fields
  event_idea TEXT,
  why_host TEXT,

  -- Attendee-specific fields
  interests TEXT,
  neighborhoods TEXT,

  -- Founder workflow
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'declined', 'archived')),
  notes TEXT,
  contacted_at TIMESTAMPTZ,

  -- Conversion tracking (links to user when they become a real user)
  converted_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,

  -- Track multiple submissions from same person
  submission_count INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Founders can do everything
CREATE POLICY "Founders can manage leads"
  ON leads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'founder'
    )
  );

-- Anyone can insert (for phone mockup lead capture)
CREATE POLICY "Anyone can submit leads"
  ON leads
  FOR INSERT
  WITH CHECK (true);
