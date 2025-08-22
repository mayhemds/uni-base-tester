-- Universal Database Test Table
CREATE TABLE IF NOT EXISTS db_connection_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE db_connection_test IS 'Universal database connection test table';
