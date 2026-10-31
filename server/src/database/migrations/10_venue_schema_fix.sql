-- Migration 10: fix venue schema for real-world data
-- Multiple venues can share the same building address (e.g. DHA complexes),
-- so the unique constraint on address is too strict.
-- Also increase name length from 50 → 150 chars to fit full venue names.

ALTER TABLE venue DROP CONSTRAINT IF EXISTS venue_address_key;
ALTER TABLE venue ALTER COLUMN name TYPE VARCHAR(150);
