CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL,
  automation_need TEXT NOT NULL,
  monthly_volume TEXT NOT NULL,
  project_details TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  source_page TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  internal_email_status TEXT NOT NULL DEFAULT 'pending',
  customer_email_status TEXT NOT NULL DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_ip_created ON leads(ip_hash,created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
