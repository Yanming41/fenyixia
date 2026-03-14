-- 创建 invitations 表（好友邀请系统）
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 索引
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 用户可以插入自己发出的邀请
CREATE POLICY "invitations_insert_own" ON invitations
  FOR INSERT WITH CHECK (auth.uid() = inviter_id);

-- 用户可以读取自己发出的邀请
CREATE POLICY "invitations_read_own" ON invitations
  FOR SELECT USING (auth.uid() = inviter_id);

-- 邀请被接受时可以更新状态（通过 token 匹配，注册流程更新）
CREATE POLICY "invitations_update_by_token" ON invitations
  FOR UPDATE USING (true)
  WITH CHECK (status = 'accepted');
