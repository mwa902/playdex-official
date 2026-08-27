DROP TABLE IF EXISTS event_type;

CREATE TABLE event_type(

     id   UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
     name VARCHAR(60)      NOT NULl,
     description  TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



