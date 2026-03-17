-- ══════════════════════════════════════════════════════════════
--  Migration: Upgrade friendships table for WeChat-style contacts
--  Adds status (pending/accepted/rejected), alias_a, alias_b
-- ══════════════════════════════════════════════════════════════

-- Add status column with default 'accepted' for existing rows
ALTER TABLE friendships
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted'
    CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Alias fields: each user can set a nickname for the other
ALTER TABLE friendships
  ADD COLUMN IF NOT EXISTS alias_a text,  -- alias set by user_a for user_b
  ADD COLUMN IF NOT EXISTS alias_b text;  -- alias set by user_b for user_a

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
