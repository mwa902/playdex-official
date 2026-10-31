-- Migration 11: add price column to events
-- price is the cash amount shown on the public slot box (PKR).
-- NULL means free / contact venue.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT NULL;
