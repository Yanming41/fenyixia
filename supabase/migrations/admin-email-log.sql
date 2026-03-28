-- Admin email send log: tracks every email sent via the send-email Edge Function.
-- Used by the admin panel to monitor email rate limit usage.
-- Only accessible via service role key (Edge Functions); RLS blocks all direct client access.

CREATE TABLE IF NOT EXISTS admin_email_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email text NOT NULL,
  email_type text NOT NULL,
  sent_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_email_log_sent_at ON admin_email_log(sent_at DESC);

ALTER TABLE admin_email_log ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT policies: only service role (Edge Functions) can access this table.
