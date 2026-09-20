CREATE TABLE IF NOT EXISTS organization (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(60)  NOT NULL,
  description  TEXT,
  phone_no     VARCHAR(20)  NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
