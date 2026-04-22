CREATE TABLE IF NOT EXISTS users (
    user_id           SERIAL PRIMARY KEY, 
    username          VARCHAR(40) NOT NULL,
    email             VARCHAR(100) UNIQUE NOT NULL,
    password_hash     TEXT NOT NULL, 
    display_name      VARCHAR(40),
    profile_image_url VARCHAR(255),
    country           VARCHAR(20),
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);