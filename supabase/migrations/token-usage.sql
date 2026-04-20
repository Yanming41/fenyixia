-- Token usage tracking for AI API calls
CREATE TABLE IF NOT EXISTS token_usage (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  feature     text NOT NULL,  -- 'scan_receipt' | 'dispute_ai'
  model       text NOT NULL,
  input_tokens  int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0
);

ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own token usage"
  ON token_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users select own token usage"
  ON token_usage FOR SELECT
  USING (auth.uid() = user_id);
