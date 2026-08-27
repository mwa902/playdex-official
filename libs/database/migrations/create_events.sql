DROP TABLE IF EXISTS events;

CREATE TABLE events
(
    id              UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    organization_id UUID             NOT NULL,
    venue_id        UUID             NOT NULL,
    event_type_id   UUID             NOT NULL,
    name            VARCHAR(150)     NOT NULL,
    description     TEXT             NOT NULL,
    started_at      TIMESTAMP        NOT NULL,
    ended_at        TIMESTAMP        NOT NULL,
    capacity        INT              NOT NULL,
    status          VARCHAR(20)      NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Not-Available')),
    created_at      TIMESTAMP                 DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP                 DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organization (id),
    FOREIGN KEY (venue_id) REFERENCES venue (id),
    FOREIGN KEY (event_type_id) REFERENCES event_type (id)
);

