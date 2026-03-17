-- ══════════════════════════════════════════════════════════════
--  Migration: user_tags & friend_tags tables
--  Tags are private per-user categorization of friends
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#0A84FF',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS friend_tags (
  tag_id uuid REFERENCES user_tags(id) ON DELETE CASCADE NOT NULL,
  friendship_id uuid REFERENCES friendships(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (tag_id, friendship_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_tags_user ON user_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_tags_tag ON friend_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_friend_tags_friendship ON friend_tags(friendship_id);
