ALTER TABLE app.listings ALTER COLUMN "language" SET NOT NULL;
ALTER TABLE app.listings ALTER COLUMN status SET NOT NULL;
ALTER TABLE app.listings ALTER COLUMN quantity SET NOT NULL;
ALTER TABLE app.listings ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE app.listings ALTER COLUMN rarity SET NOT NULL;
ALTER TABLE app.listings ALTER COLUMN card_id SET NOT NULL;

alter table app.listings add column game varchar(50) default 'MAGIC' not null