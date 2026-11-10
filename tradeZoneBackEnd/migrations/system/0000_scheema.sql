CREATE SCHEMA IF NOT EXISTS system;

CREATE TABLE IF NOT EXISTS system.migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,                 
  executed_at TIMESTAMPTZ DEFAULT NOW(),     
  checksum VARCHAR(64),                      
  applied_by VARCHAR(100) DEFAULT CURRENT_USER,
  success BOOLEAN DEFAULT TRUE,             
  duration_ms INT,                            
  notes TEXT                                 
);

CREATE TABLE IF NOT EXISTS system.migrations_system (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,                 
  executed_at TIMESTAMPTZ DEFAULT NOW(),     
  checksum VARCHAR(64),                      
  applied_by VARCHAR(100) DEFAULT CURRENT_USER,
  success BOOLEAN DEFAULT TRUE,             
  duration_ms INT,                            
  notes TEXT                                 
);

CREATE INDEX idx_migrations_name ON system.migrations (name);
CREATE INDEX idx_migrations_executed_at ON system.migrations (executed_at);

CREATE INDEX idx_migrations_system_name ON system.migrations_system (name);
CREATE INDEX idx_migrations_system_executed_at ON system.migrations_system (executed_at);
