DROP TABLE IF EXISTS venue;

CREATE TABLE venue
(
    id              UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organization_id UUID             NOt NULL,
    name            VARCHAR(50)      NOT NULL UNIQUE,
    description     TEXT,
    address         TEXT             NOT NULL UNIQUE,
    city            VARCHAR(60)      NOT NULL DEFAULT ('Lahore'),
    capacity        INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);