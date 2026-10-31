-- Migration 12: fix users table column lengths and add superadmin role
-- password was varchar(40) — too short for bcrypt (60 chars minimum)
-- name and email were also too short for real data

ALTER TABLE users ALTER COLUMN password TYPE VARCHAR(255);
ALTER TABLE users ALTER COLUMN name     TYPE VARCHAR(100);
ALTER TABLE users ALTER COLUMN email    TYPE VARCHAR(254);

-- Add superadmin to the user_role enum (safe if already exists)
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
