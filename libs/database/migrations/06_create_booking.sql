DROP TABLE IF EXISTS booking;

CREATE TYPE status_book AS ENUM('Pending','Confirm Booking','Cancelled');
CREATE TABLE booking (
     id             UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
     event_id       UUID             NOT NULL,
     customer_name  VARCHAR(100)     NOT NULL,
     customer_email VARCHAR(100)     NOT NULL,
     customer_phone VARCHAR(20)      NOT NULL,
     seats          INT              NOT NULL CHECK (seats > 0),
     status status_book NOT NULL DEFAULT('Pending'),
     booked_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
     created_at     TIMESTAMP                 DEFAULT CURRENT_TIMESTAMP,
     updated_at     TIMESTAMP                 DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (event_id) REFERENCES events (id)
);