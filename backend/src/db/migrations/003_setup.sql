CREATE TABLE IF NOT EXISTS setup (
  id SERIAL PRIMARY KEY,
  fiscal_year_start DATE,
  reporting_months JSONB,
  categories JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- ensure a single row for system config
INSERT INTO setup (id) SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM setup WHERE id=1);
