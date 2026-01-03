-- SMS Platform Migration: Rename rooms to spaces
-- Version: 4.0
-- Description: Rename rooms table to spaces and update all references

-- ============================================
-- RENAME MAIN TABLE
-- ============================================
ALTER TABLE rooms RENAME TO spaces;

-- ============================================
-- RENAME FOREIGN KEY COLUMNS
-- ============================================

-- Invitations table
ALTER TABLE invitations RENAME COLUMN room_id TO space_id;

-- Feedback table
ALTER TABLE feedback RENAME COLUMN room_id TO space_id;

-- Trust events table
ALTER TABLE trust_events RENAME COLUMN room_id TO space_id;

-- Host prompts table
ALTER TABLE host_prompts RENAME COLUMN room_id TO space_id;

-- SMS conversations (context_id is generic, but update comments)
-- Note: context_id remains as-is since it's a generic reference

-- ============================================
-- RENAME USER STATS COLUMNS
-- ============================================
ALTER TABLE users RENAME COLUMN rooms_attended TO spaces_attended;
ALTER TABLE users RENAME COLUMN rooms_hosted TO spaces_hosted;

-- ============================================
-- RENAME INDEXES (Postgres auto-renames some, but let's be explicit)
-- ============================================

-- Spaces (formerly rooms) indexes
ALTER INDEX IF EXISTS idx_rooms_host RENAME TO idx_spaces_host;
ALTER INDEX IF EXISTS idx_rooms_status RENAME TO idx_spaces_status;
ALTER INDEX IF EXISTS idx_rooms_date RENAME TO idx_spaces_date;

-- Invitations indexes
ALTER INDEX IF EXISTS idx_invitations_room RENAME TO idx_invitations_space;

-- Feedback indexes
ALTER INDEX IF EXISTS idx_feedback_room RENAME TO idx_feedback_space;

-- Host prompts indexes
ALTER INDEX IF EXISTS idx_host_prompts_room RENAME TO idx_host_prompts_space;

-- ============================================
-- UPDATE UNIQUE CONSTRAINTS
-- ============================================

-- Drop and recreate unique constraint on invitations
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_room_id_user_id_key;
ALTER TABLE invitations ADD CONSTRAINT invitations_space_id_user_id_key UNIQUE (space_id, user_id);

-- Drop and recreate unique constraint on feedback
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_room_id_user_id_key;
ALTER TABLE feedback ADD CONSTRAINT feedback_space_id_user_id_key UNIQUE (space_id, user_id);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Drop and recreate the spaces update trigger
DROP TRIGGER IF EXISTS update_rooms_updated_at ON spaces;
CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- UPDATE PROMPT TYPES (optional: keep as is for now)
-- ============================================
-- The prompt_type values like 'pre_room' could be renamed to 'pre_space'
-- but keeping them as-is for backward compatibility with existing data
-- This can be done in a future migration if needed:
--
-- UPDATE host_prompts SET prompt_type = 'pre_space' WHERE prompt_type = 'pre_room';
-- ALTER TABLE host_prompts DROP CONSTRAINT host_prompts_prompt_type_check;
-- ALTER TABLE host_prompts ADD CONSTRAINT host_prompts_prompt_type_check
--   CHECK (prompt_type IN ('pre_space', 'opening', 'check_in', 'energy_check', 'closing_warning', 'closing'));
