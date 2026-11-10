CREATE TABLE app.listing_images (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES app.listings(id) ON DELETE CASCADE,
  fs_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


alter table app.listings drop column image_url

