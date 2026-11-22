ALTER TABLE booking
  ADD COLUMN IF NOT EXISTS membership_monthly_fee INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS membership_joining_fee INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS gym_membership (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email  VARCHAR(100) NOT NULL,
  venue_id        UUID NOT NULL REFERENCES venue(id) ON DELETE CASCADE,
  booking_id      UUID NOT NULL UNIQUE REFERENCES booking(id) ON DELETE CASCADE,
  monthly_fee     INTEGER NOT NULL CHECK (monthly_fee BETWEEN 200 AND 2500),
  joining_fee     INTEGER NOT NULL CHECK (joining_fee IN (0, 1000)),
  status          VARCHAR(20) NOT NULL DEFAULT 'Pending'
                    CHECK (status IN ('Pending', 'Active', 'Cancelled')),
  started_at      TIMESTAMP,
  expires_at      TIMESTAMP,
  payment_method  VARCHAR(40),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS gym_membership_customer_venue_idx
  ON gym_membership (LOWER(customer_email), venue_id, status, expires_at);
