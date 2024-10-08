CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(500) NOT NULL UNIQUE,
  name VARCHAR(500) NOT NULL,
  given_name VARCHAR(500) NOT NULL,
  family_name VARCHAR(500) NOT NULL,
  picture VARCHAR(500) NOT NULL
);

CREATE TABLE IF NOT EXISTS google_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL,
  refresh_token VARCHAR(300) NOT NULL,
  access_token VARCHAR(300) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  token_type VARCHAR(150) NOT NULL
);
