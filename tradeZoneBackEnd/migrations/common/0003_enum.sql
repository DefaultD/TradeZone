-- 1) Criar ENUM de condição
CREATE TYPE app.listing_condition AS ENUM (
    'NM',  -- Near Mint
    'LP',  -- Lightly Played
    'MP',  -- Moderately Played
    'HP',   -- Heavily Played
    'DMG'
);

-- 2) Criar ENUM de raridade
CREATE TYPE app.listing_rarity AS ENUM (
    'COMMON',
    'UNCOMMON',
    'RARE',
    'MYTHIC'
);

-- 3) Alterar colunas existentes para ENUM
ALTER TABLE app.listings 
    ALTER COLUMN condition TYPE app.listing_condition USING condition::app.listing_condition;

ALTER TABLE app.listings  
    ALTER COLUMN rarity TYPE app.listing_rarity USING rarity::app.listing_rarity;
