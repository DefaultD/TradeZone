-- Schema: app
CREATE SCHEMA IF NOT EXISTS app;

-- Enum
CREATE TYPE app.user_role_enum AS ENUM ('user', 'admin');

-- Table: users
CREATE TABLE app.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),
    apple_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP(6) DEFAULT now(),
    updated_at TIMESTAMP(6) DEFAULT now(),
    role app.user_role_enum DEFAULT 'user',
    accepted_terms BOOLEAN DEFAULT false,
    terms_accepted_at TIMESTAMPTZ(6)
);

-- Table: profiles
CREATE TABLE app.profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(100),
    bio VARCHAR(500),
    avatar_url VARCHAR(255),
    date_of_birth DATE,
    cpf VARCHAR(20) UNIQUE,
    rg VARCHAR(30),
    phone VARCHAR(30),
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP(6) DEFAULT now(),
    updated_at TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

-- Table: roles
CREATE TABLE app.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- Table: user_roles
CREATE TABLE app.user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES app.roles (id)
        ON DELETE CASCADE
);

-- Table: cards
CREATE TABLE app.cards (
    id SERIAL PRIMARY KEY,
    api_card_id VARCHAR(100) UNIQUE,
    name VARCHAR(150) NOT NULL,
    image_url TEXT,
    set_name VARCHAR(100),
    rarity VARCHAR(50),
    type_line VARCHAR(100),
    color_identity VARCHAR(20),
    mana_cost VARCHAR(50),
    price DECIMAL(10,2),
    is_from_api BOOLEAN DEFAULT true,
    last_fetched_at TIMESTAMP(6) DEFAULT now(),
    created_at TIMESTAMP(6) DEFAULT now()
);
CREATE INDEX idx_cards_name ON app.cards (name);

-- Table: listings
CREATE TABLE app.listings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    card_id INT,
    price DECIMAL(10,2) NOT NULL,
    condition VARCHAR(20),
    language VARCHAR(20),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    quantity INT DEFAULT 1,
    created_at TIMESTAMP(6) DEFAULT now(),
    updated_at TIMESTAMP(6) DEFAULT now(),
    deleted_at TIMESTAMP(6),
    CONSTRAINT fk_listings_user FOREIGN KEY (user_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_listings_card FOREIGN KEY (card_id)
        REFERENCES app.cards (id)
);
CREATE INDEX idx_listings_status ON app.listings (status);

-- Table: favorites
CREATE TABLE app.favorites (
    user_id INT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP(6) DEFAULT now(),
    PRIMARY KEY (user_id, listing_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_favorites_listing FOREIGN KEY (listing_id)
        REFERENCES app.listings (id)
        ON DELETE CASCADE
);

-- Table: sales
CREATE TABLE app.sales (
    id SERIAL PRIMARY KEY,
    listing_id INT,
    buyer_id INT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP(6) DEFAULT now(),
    updated_at TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT fk_sales_listing FOREIGN KEY (listing_id)
        REFERENCES app.listings (id),
    CONSTRAINT fk_sales_buyer FOREIGN KEY (buyer_id)
        REFERENCES app.users (id)
);
CREATE INDEX idx_sales_status ON app.sales (status);

-- Table: trades
CREATE TABLE app.trades (
    id SERIAL PRIMARY KEY,
    user_offer_id INT NOT NULL,
    user_receive_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP(6) DEFAULT now(),
    updated_at TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT fk_trades_offer FOREIGN KEY (user_offer_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_trades_receive FOREIGN KEY (user_receive_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE
);
CREATE INDEX idx_trades_status ON app.trades (status);

-- Table: trade_items
CREATE TABLE app.trade_items (
    id SERIAL PRIMARY KEY,
    trade_id INT NOT NULL,
    card_id INT NOT NULL,
    quantity INT DEFAULT 1,
    owner_id INT NOT NULL,
    CONSTRAINT fk_trade_items_trade FOREIGN KEY (trade_id)
        REFERENCES app.trades (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_trade_items_card FOREIGN KEY (card_id)
        REFERENCES app.cards (id),
    CONSTRAINT fk_trade_items_owner FOREIGN KEY (owner_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE
);

-- Table: transactions_log
CREATE TABLE app.transactions_log (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL,
    reference_id INT,
    created_at TIMESTAMP(6) DEFAULT now(),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id)
        REFERENCES app.users (id)
        ON DELETE CASCADE
);

-- ✅ Final verification
COMMENT ON SCHEMA app IS 'TradeZone main schema';
