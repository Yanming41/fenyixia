-- ══════════════════════════════════════════════════════════════
--  RLS policies for new tables: groups, group_members, user_tags, friend_tags
--  + updated friendships policies to account for status
-- ══════════════════════════════════════════════════════════════

-- ── Groups ──
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_read_member" ON groups FOR SELECT USING (
  owner_id = auth.uid()
  OR id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
);

CREATE POLICY "groups_insert_owner" ON groups FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

CREATE POLICY "groups_update_owner" ON groups FOR UPDATE USING (
  owner_id = auth.uid()
);

CREATE POLICY "groups_delete_owner" ON groups FOR DELETE USING (
  owner_id = auth.uid()
);

-- ── Group Members ──
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_members_read" ON group_members FOR SELECT USING (
  group_id IN (
    SELECT id FROM groups WHERE owner_id = auth.uid()
    UNION
    SELECT group_id FROM group_members gm WHERE gm.user_id = auth.uid()
  )
);

CREATE POLICY "group_members_insert" ON group_members FOR INSERT WITH CHECK (
  group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
);

CREATE POLICY "group_members_delete" ON group_members FOR DELETE USING (
  group_id IN (SELECT id FROM groups WHERE owner_id = auth.uid())
  OR user_id = auth.uid()  -- members can leave
);

-- ── User Tags (private to owner) ──
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tags_all" ON user_tags FOR ALL USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- ── Friend Tags (private to tag owner) ──
ALTER TABLE friend_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "friend_tags_all" ON friend_tags FOR ALL USING (
  tag_id IN (SELECT id FROM user_tags WHERE user_id = auth.uid())
) WITH CHECK (
  tag_id IN (SELECT id FROM user_tags WHERE user_id = auth.uid())
);

-- ── Updated friendships: allow reading pending requests directed at me ──
-- Drop old read policy and replace with expanded one
DROP POLICY IF EXISTS "friendships_read" ON friendships;

CREATE POLICY "friendships_read" ON friendships FOR SELECT USING (
  user_a = auth.uid() OR user_b = auth.uid()
);

-- Allow updating friendships where user is involved (for accepting/rejecting)
CREATE POLICY "friendships_update" ON friendships FOR UPDATE USING (
  user_a = auth.uid() OR user_b = auth.uid()
);
