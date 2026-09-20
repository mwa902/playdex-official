DO $$ BEGIN
  CREATE TYPE status_book AS ENUM ('Pending', 'Confirm Booking', 'Cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS booking (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID         NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  customer_name  VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20)  NOT NULL,
  seats          INT          NOT NULL CHECK (seats > 0),
  status         status_book  NOT NULL DEFAULT 'Pending',
  booked_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS booking_event_id_idx ON booking(event_id);
