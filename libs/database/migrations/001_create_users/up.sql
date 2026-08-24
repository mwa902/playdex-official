DROP TABLE IF EXISTS users;

CREATE TABLE users (
        id INT PRIMARY KEY NOT NULL,
        name VARCHAR(45) NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(30) NOT NULL,
        role VARCHAR(35) DEFAULT 'user' NOT NULL
);
