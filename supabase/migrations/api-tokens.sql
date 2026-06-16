CREATE TABLE IF NOT EXISTS api_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text        NOT NULL UNIQUE,
  name        text        NOT NULL DEFAULT 'AI Token',
  created_at  timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own tokens" ON api_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
