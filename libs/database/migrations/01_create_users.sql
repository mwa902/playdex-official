CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
     CREATE TYPE user_role AS ENUM ('Admin', 'user', 'organization');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
     CREATE TYPE active_idea AS ENUM ('Active', 'Not-Active');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(45) NOT NULL,
     email VARCHAR(254) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     role user_role NOT NULL DEFAULT 'user',
     is_active active_idea NOT NULL DEFAULT 'Not-Active',
     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
