-- Fixed: original had two CREATE TABLE statements, merged into one clean definition
CREATE TABLE IF NOT EXISTS events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID         NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  venue_id        UUID         NOT NULL REFERENCES venue(id)        ON DELETE RESTRICT,
  event_type_id   UUID         NOT NULL REFERENCES event_type(id)   ON DELETE RESTRICT,
  name            VARCHAR(150) NOT NULL,
  description     TEXT         NOT NULL DEFAULT '',
  started_at      TIMESTAMP    NOT NULL,
  ended_at        TIMESTAMP    NOT NULL,
  capacity        INT          NOT NULL CHECK (capacity > 0),
  status          VARCHAR(20)  NOT NULL DEFAULT 'Available'
                    CHECK (status IN ('Available', 'Not-Available')),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT events_time_order CHECK (ended_at > started_at)
);

CREATE INDEX IF NOT EXISTS events_organization_id_idx ON events(organization_id);
CREATE INDEX IF NOT EXISTS events_venue_id_idx        ON events(venue_id);
CREATE INDEX IF NOT EXISTS events_event_type_id_idx   ON events(event_type_id);
