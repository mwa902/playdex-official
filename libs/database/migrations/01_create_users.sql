DROP TABLE IF EXISTS Users;

CREATE TYPE user_role AS ENUM('Admin','user','organization');
CREATE TYPE active_idea AS ENUM('Active','Not-Active');

CREATE TABLE users (
     id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
     role_id UUID NOT NULL,
     name VARCHAR(45) NOT NULL,
     email VARCHAR(50) UNIQUE NOT NULL,
     password VARCHAR(40) NOT NULL,
     role user_role NOT NULL DEFAULT 'user',
     is_active active_idea NOT NULL DEFAULT('Not-Active'),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
