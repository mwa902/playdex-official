-- Migration 08: add sport_type, phone, and google_maps_url columns to venue
-- sport_type lets the public arena-finder filter by category (Arena, Gym, Pool)
-- phone allows venues to display a contact number on the public listing
-- google_maps_url stores a deep-link for the venue card "Open in Maps" button

ALTER TABLE venue
  ADD COLUMN IF NOT EXISTS sport_type  VARCHAR(60)  NOT NULL DEFAULT 'Arena',
  ADD COLUMN IF NOT EXISTS phone       VARCHAR(30),
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT;

CREATE INDEX IF NOT EXISTS venue_sport_type_idx ON venue(sport_type);
