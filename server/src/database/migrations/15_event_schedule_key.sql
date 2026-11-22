ALTER TABLE events
  ADD COLUMN IF NOT EXISTS schedule_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS events_schedule_key_idx
  ON events(schedule_key)
  WHERE schedule_key IS NOT NULL;