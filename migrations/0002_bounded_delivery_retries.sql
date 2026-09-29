ALTER TABLE leads ADD COLUMN internal_email_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN internal_email_next_retry_at TEXT;
ALTER TABLE leads ADD COLUMN internal_email_last_attempt_at TEXT;
ALTER TABLE leads ADD COLUMN customer_email_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN customer_email_next_retry_at TEXT;
ALTER TABLE leads ADD COLUMN customer_email_last_attempt_at TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_internal_retry
  ON leads(internal_email_status, internal_email_next_retry_at);
CREATE INDEX IF NOT EXISTS idx_leads_customer_retry
  ON leads(customer_email_status, customer_email_next_retry_at);
