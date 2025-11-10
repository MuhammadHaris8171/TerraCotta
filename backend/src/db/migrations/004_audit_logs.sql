CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type TEXT,
  entity_id INTEGER,
  action TEXT,
  changes JSONB,
  performed_by INTEGER REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT
);
