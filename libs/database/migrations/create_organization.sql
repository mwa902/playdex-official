DROP TABLE IF EXISTS organization;

CREATE TABLE organization
(
    id           UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    company_name VARCHAR(60)      NOT NULl,
    description  TEXT,
    phone_no     VARCHAR(15)              NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);