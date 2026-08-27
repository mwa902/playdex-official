DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
     id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
     role_id UUID NOT NULL,
     name VARCHAR(45) NOT NULL,
     email VARCHAR(50) UNIQUE NOT NULL,
     password VARCHAR(40) NOT NULL,
     is_active ENUM("Active","In-active"),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (role_id) REFERENCES ROLES(id)
);
