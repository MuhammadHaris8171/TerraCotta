CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  member_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount NUMERIC(18,2) NOT NULL,
  category TEXT,
  description TEXT,
  date DATE NOT NULL,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
