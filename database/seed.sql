-- Restaurant POS System Seed Data
-- Initial data for development and testing

-- Insert default admin user
INSERT INTO users (username, email, password, first_name, last_name, role, is_active)
VALUES (
    'admin',
    'admin@resto.com',
    '$2b$10$6RQvIZFJJCEALKnJMVjrWOhxjLOlGpVqcWqvWUDLJNJgC1DmGWn3K', -- password: admin123
    'Admin',
    'User',
    'super_admin',
    true
);

-- Insert sample categories
INSERT INTO categories (name, description, color, is_active, sort_order) VALUES
('Appetizers', 'Starters and small plates', '#ff6b6b', true, 1),
('Main Courses', 'Primary dishes', '#4ecdc4', true, 2),
('Desserts', 'Sweet endings', '#45b7d1', true, 3),
('Beverages', 'Drinks and refreshments', '#96ceb4', true, 4),
('Sides', 'Side dishes and extras', '#feca57', true, 5);

-- Insert sample products
INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'Caesar Salad',
    'Crisp romaine lettuce with caesar dressing',
    'APP-001',
    c.id,
    12.99,
    4.50,
    true,
    false,
    100,
    10
FROM categories c WHERE c.name = 'Appetizers';

INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'Chicken Wings',
    'Crispy wings with choice of sauce',
    'APP-002',
    c.id,
    14.99,
    6.00,
    true,
    true,
    50,
    5
FROM categories c WHERE c.name = 'Appetizers';

INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'Grilled Salmon',
    'Fresh atlantic salmon with herbs',
    'MAIN-001',
    c.id,
    24.99,
    12.00,
    true,
    false,
    30,
    3
FROM categories c WHERE c.name = 'Main Courses';

INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'Beef Burger',
    'Juicy beef patty with fresh toppings',
    'MAIN-002',
    c.id,
    16.99,
    8.00,
    true,
    true,
    40,
    5
FROM categories c WHERE c.name = 'Main Courses';

INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'Chocolate Cake',
    'Rich chocolate layer cake',
    'DESS-001',
    c.id,
    8.99,
    3.00,
    true,
    false,
    20,
    2
FROM categories c WHERE c.name = 'Desserts';

INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'Coffee',
    'Fresh brewed coffee',
    'BEV-001',
    c.id,
    3.99,
    1.00,
    true,
    true,
    200,
    20
FROM categories c WHERE c.name = 'Beverages';

INSERT INTO products (name, description, sku, category_id, price, cost, is_active, has_variants, stock_quantity, low_stock_threshold)
SELECT 
    'French Fries',
    'Crispy golden fries',
    'SIDE-001',
    c.id,
    5.99,
    2.00,
    true,
    true,
    100,
    10
FROM categories c WHERE c.name = 'Sides';

-- Insert product variants
INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Buffalo',
    14.99,
    6.00,
    'APP-002-BUF',
    25,
    true
FROM products p WHERE p.sku = 'APP-002';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'BBQ',
    14.99,
    6.00,
    'APP-002-BBQ',
    25,
    true
FROM products p WHERE p.sku = 'APP-002';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Classic',
    16.99,
    8.00,
    'MAIN-002-CLA',
    20,
    true
FROM products p WHERE p.sku = 'MAIN-002';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Bacon Cheeseburger',
    19.99,
    10.00,
    'MAIN-002-BAC',
    20,
    true
FROM products p WHERE p.sku = 'MAIN-002';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Small',
    3.99,
    1.00,
    'BEV-001-SM',
    100,
    true
FROM products p WHERE p.sku = 'BEV-001';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Large',
    5.99,
    1.50,
    'BEV-001-LG',
    100,
    true
FROM products p WHERE p.sku = 'BEV-001';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Regular',
    5.99,
    2.00,
    'SIDE-001-REG',
    50,
    true
FROM products p WHERE p.sku = 'SIDE-001';

INSERT INTO product_variants (product_id, name, price, cost, sku, stock_quantity, is_active)
SELECT 
    p.id,
    'Large',
    7.99,
    2.50,
    'SIDE-001-LG',
    50,
    true
FROM products p WHERE p.sku = 'SIDE-001';

-- Insert sample customers
INSERT INTO customers (first_name, last_name, email, phone, address, is_active)
VALUES 
('John', 'Doe', 'john.doe@email.com', '+1234567890', '123 Main St, City, State 12345', true),
('Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '456 Oak Ave, City, State 12345', true),
('Bob', 'Johnson', 'bob.johnson@email.com', '+1234567892', '789 Pine Rd, City, State 12345', true);

-- Insert sample tables
INSERT INTO tables (number, name, capacity, status)
VALUES 
('1', 'Table 1', 2, 'available'),
('2', 'Table 2', 4, 'available'),
('3', 'Table 3', 6, 'available'),
('4', 'Table 4', 4, 'available'),
('5', 'Table 5', 2, 'available'),
('6', 'Table 6', 8, 'available');

-- Insert sample staff users
INSERT INTO users (username, email, password, first_name, last_name, role, is_active)
VALUES 
('manager1', 'manager@resto.com', '$2b$10$6RQvIZFJJCEALKnJMVjrWOhxjLOlGpVqcWqvWUDLJNJgC1DmGWn3K', 'Mike', 'Manager', 'manager', true),
('cashier1', 'cashier@resto.com', '$2b$10$6RQvIZFJJCEALKnJMVjrWOhxjLOlGpVqcWqvWUDLJNJgC1DmGWn3K', 'Sarah', 'Cashier', 'cashier', true),
('staff1', 'staff@resto.com', '$2b$10$6RQvIZFJJCEALKnJMVjrWOhxjLOlGpVqcWqvWUDLJNJgC1DmGWn3K', 'Tom', 'Staff', 'staff', true);

-- Insert configuration
INSERT INTO config (key, value, description)
VALUES 
('store_name', 'My Restaurant', 'Restaurant name'),
('store_address', '123 Main St, City, State 12345', 'Restaurant address'),
('store_phone', '+1234567890', 'Restaurant phone number'),
('store_email', 'contact@myrestaurant.com', 'Restaurant email'),
('currency', 'USD', 'Default currency'),
('tax_rate', '0.08', 'Tax rate (8%)'),
('timezone', 'America/New_York', 'Default timezone'),
('receipt_header', 'Thank you for dining with us!', 'Receipt header text'),
('receipt_footer', 'Have a great day!', 'Receipt footer text'),
('enable_inventory', 'true', 'Enable inventory tracking'),
('enable_customers', 'true', 'Enable customer management'),
('enable_tables', 'true', 'Enable table management'),
('sync_interval', '15000', 'Sync interval in milliseconds'),
('offline_mode', 'false', 'Enable offline mode'); 