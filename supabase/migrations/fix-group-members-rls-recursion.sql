-- Fix: group_members_read policy caused recursive RLS evaluation for non-owners.
-- Non-owner members could only see themselves because the USING clause queried
-- group_members again, triggering the same policy recursively.
-- Fix: use a SECURITY DEFINER function to bypass RLS in the subquery.

CREATE OR REPLACE FUNCTION get_my_group_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM group_members WHERE user_id = auth.uid();
$$;

DROP POLICY IF EXISTS "group_members_read" ON group_members;

CREATE POLICY "group_members_read" ON group_members FOR SELECT USING (
  group_id IN (
    SELECT id FROM groups WHERE owner_id = auth.uid()
    UNION ALL
    SELECT get_my_group_ids()
  )
);
