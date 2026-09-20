CREATE TABLE IF NOT EXISTS venue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organization (id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    address TEXT NOT NULL UNIQUE,
    city VARCHAR(60) NOT NULL DEFAULT 'Lahore',
    capacity INT NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS venue_organization_id_idx ON venue (organization_id);