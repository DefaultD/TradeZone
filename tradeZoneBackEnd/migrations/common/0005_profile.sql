-- =====================================
-- DROP TABLES (ordem correta)
-- =====================================

DROP TABLE IF EXISTS app.profile_badges CASCADE;
DROP TABLE IF EXISTS app.profile_stats CASCADE;
DROP TABLE IF EXISTS app.user_reviews CASCADE;
DROP TABLE IF EXISTS app.user_history CASCADE;
DROP TABLE IF EXISTS app.profiles CASCADE;
DROP TABLE IF EXISTS app.users CASCADE;

-- =====================================
-- 1) TABELA DE USUÁRIOS (AUTH)
-- =====================================

CREATE TABLE app.users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(150) UNIQUE,
    password VARCHAR(255),

    apple_id VARCHAR(255) UNIQUE,

    role VARCHAR(50) DEFAULT 'user',

    accepted_terms BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMPTZ,

    name VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 2) PERFIL DO USUÁRIO (dados visuais)
-- =====================================

CREATE TABLE app.profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,

    name VARCHAR(100),
    bio VARCHAR(500),

    avatar_url VARCHAR(255),
    banner_url VARCHAR(255),

    location VARCHAR(150),

    date_of_birth DATE,
    cpf VARCHAR(20) UNIQUE,
    rg VARCHAR(30),

    phone VARCHAR(30),
    phone_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 3) ESTATÍSTICAS DO PERFIL
-- =====================================

CREATE TABLE app.profile_stats (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,

    rating_average NUMERIC(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,

    listings_count INT DEFAULT 0,
    trades_count INT DEFAULT 0,

    response_rate INT DEFAULT 0,
    response_time_hours INT DEFAULT 0,

    cancellations_count INT DEFAULT 0,
    reliability INT DEFAULT 100,

    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 4) BADGES DO PERFIL
-- =====================================

CREATE TABLE app.profile_badges (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,

    is_verified BOOLEAN DEFAULT FALSE,
    is_top_trader BOOLEAN DEFAULT FALSE,
    is_reliable_seller BOOLEAN DEFAULT FALSE,

    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 5) AVALIAÇÕES ENTRE USUÁRIOS
-- =====================================

CREATE TABLE app.user_reviews (
    id SERIAL PRIMARY KEY,

    reviewer_id INT NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
    target_user_id INT NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_reviews_target ON app.user_reviews (target_user_id);

-- =====================================
-- 6) HISTÓRICO DO USUÁRIO (vendas e trocas)
-- =====================================

CREATE TABLE app.user_history (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,

    title VARCHAR(150) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('sale', 'trade')),

    amount NUMERIC(10,2),
    partner_name VARCHAR(100),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_history_user ON app.user_history (user_id);

ALTER TABLE app.listings
ADD CONSTRAINT fk_listings_user
    FOREIGN KEY (user_id)
    REFERENCES app.users(id)
    ON DELETE CASCADE;