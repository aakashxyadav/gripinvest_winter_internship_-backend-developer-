-- MySQL schema for Grip Invest

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  -- Required fields per spec
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NULL,
  risk_appetite ENUM('low','moderate','high') DEFAULT 'moderate',
  -- Extra fields used by app features
  role ENUM('user','admin') DEFAULT 'user',
  otp_code VARCHAR(10),
  otp_expires_at DATETIME,
  full_name VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  profile_photo_url VARCHAR(512) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investment_products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  -- Required fields per spec
  investment_type ENUM('bond','fd','mf','etf','other') NOT NULL,
  risk_level ENUM('low','moderate','high') NOT NULL,
  annual_yield DECIMAL(5,2) NOT NULL,
  min_investment DECIMAL(12,2) DEFAULT 1000.00,
  max_investment DECIMAL(12,2) NULL,
  tenure_months INT NOT NULL,
  description TEXT,
  -- Back-compat columns (legacy names) kept to ease migration
  type ENUM('bond','invoice','leasing','vc','other') NULL,
  risk ENUM('low','medium','high') NULL,
  expected_annual_yield DECIMAL(5,2) NULL,
  -- Optional audit
  created_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS investments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  -- Required fields per spec
  invested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active','matured','cancelled') DEFAULT 'active',
  expected_return DECIMAL(12,2),
  maturity_date DATE,
  -- Back-compat timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES investment_products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transaction_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id CHAR(36) NULL,
  email VARCHAR(255) NULL,
  endpoint VARCHAR(255) NOT NULL,
  -- Required fields per spec
  http_method ENUM('GET','POST','PUT','DELETE') NOT NULL,
  status_code INT NOT NULL,
  error_message TEXT,
  -- Back-compat legacy columns
  method VARCHAR(10) NULL,
  status INT NULL,
  error TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Simple wallet/balance table for business rules
CREATE TABLE IF NOT EXISTS wallets (
  user_id CHAR(36) PRIMARY KEY,
  balance DECIMAL(12,2) NOT NULL DEFAULT 100000.00,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Migration helpers for existing databases (best effort; ignore errors if column already exists)
-- Users
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) NULL AFTER password_hash;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) NULL AFTER first_name;
ALTER TABLE users MODIFY COLUMN risk_appetite ENUM('low','moderate','high') DEFAULT 'moderate';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('user','admin') DEFAULT 'user' AFTER risk_appetite;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code VARCHAR(10) AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at DATETIME AFTER otp_code;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) NULL AFTER otp_expires_at;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER full_name;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(512) NULL AFTER phone;

-- Investment products
ALTER TABLE investment_products ADD COLUMN IF NOT EXISTS investment_type ENUM('bond','fd','mf','etf','other') NULL AFTER name;
ALTER TABLE investment_products ADD COLUMN IF NOT EXISTS risk_level ENUM('low','moderate','high') NULL AFTER investment_type;
ALTER TABLE investment_products ADD COLUMN IF NOT EXISTS annual_yield DECIMAL(5,2) NULL AFTER risk_level;
ALTER TABLE investment_products MODIFY COLUMN min_investment DECIMAL(12,2) DEFAULT 1000.00;
ALTER TABLE investment_products MODIFY COLUMN max_investment DECIMAL(12,2) NULL;

-- Investments
ALTER TABLE investments ADD COLUMN IF NOT EXISTS invested_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER amount;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS maturity_date DATE NULL AFTER expected_return;
ALTER TABLE investments MODIFY COLUMN status ENUM('active','matured','cancelled') DEFAULT 'active';

-- Transaction logs
ALTER TABLE transaction_logs ADD COLUMN IF NOT EXISTS http_method ENUM('GET','POST','PUT','DELETE') NULL AFTER endpoint;
ALTER TABLE transaction_logs ADD COLUMN IF NOT EXISTS status_code INT NULL AFTER http_method;
ALTER TABLE transaction_logs ADD COLUMN IF NOT EXISTS error_message TEXT NULL AFTER status_code;
