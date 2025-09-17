-- Seed users (passwords will be re-hashed by seed util if needed)
INSERT INTO users (id, first_name, last_name, email, password_hash, risk_appetite, role) VALUES
('00000000-0000-0000-0000-000000000001','Admin','User','admin@grip.test','$2a$10$ltyyxTNuFbOXfUBE0V1fAOohUMkx3CIK4PsL7aReGwF435e9NetLO','high','admin'),
('00000000-0000-0000-0000-000000000002','Demo','User','user@grip.test','$2a$10$m9ze1jN60gVaUY3DkFM9nOUxJMme47vuM4nfWQTMnY8QiFfFTcWGq','moderate','user');

-- Ensure full_name is set for convenience
UPDATE users SET full_name = CONCAT_WS(' ', first_name, last_name) WHERE full_name IS NULL;

-- Seed wallets
INSERT INTO wallets (user_id, balance) VALUES
('00000000-0000-0000-0000-000000000001', 1000000.00),
('00000000-0000-0000-0000-000000000002', 250000.00);

-- Seed products (populate both canonical and legacy columns for compatibility)
INSERT INTO investment_products (id, name, investment_type, risk_level, annual_yield, type, risk, expected_annual_yield, min_investment, max_investment, tenure_months, description, created_by) VALUES
('10000000-0000-0000-0000-000000000001', 'Secured Corporate Bond A', 'bond', 'low', 9.50, 'bond', 'low', 9.50, 1000.00, 100000.00, 24, 'Stable fixed-income corporate bond', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'Invoice Discounting B', 'other', 'moderate', 12.00, 'invoice', 'medium', 12.00, 5000.00, 200000.00, 6, 'Short-term invoice financing', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'Equipment Leasing C', 'other', 'moderate', 14.50, 'leasing', 'medium', 14.50, 10000.00, 300000.00, 12, 'Leasing backed by equipment', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000004', 'VC Fund D', 'other', 'high', 25.00, 'vc', 'high', 25.00, 50000.00, 1000000.00, 60, 'High growth venture fund', '00000000-0000-0000-0000-000000000001');
