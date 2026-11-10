CREATE TABLE IF NOT EXISTS app.refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_refresh_user ON app.refresh_tokens(user_id);

alter table app.listings add column if not exists rarity varchar(50);

alter table app.listings add column if not exists image_url varchar(500);