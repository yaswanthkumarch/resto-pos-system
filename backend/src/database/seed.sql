-- USERS
INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
  ('admin', 'admin@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'Admin', 'User', 'super_admin');

-- CATEGORIES
INSERT INTO categories (name, color) VALUES
  ('Appetizers', '#ff0000'),
  ('Main Course', '#0000ff'),
  ('Desserts', '#ffff00'),
  ('Drinks', '#00ff00');

-- PRODUCTS (using subquery to get category_id)
INSERT INTO products (name, sku, price, category_id, description) VALUES
  ('Spring Rolls', 'APP-001', 5.99, (SELECT id FROM categories WHERE name = 'Appetizers'), 'Crispy vegetarian spring rolls'),
  ('Chicken Curry', 'MAIN-001', 12.99, (SELECT id FROM categories WHERE name = 'Main Course'), 'Spicy chicken curry'),
  ('Chocolate Cake', 'DES-001', 6.50, (SELECT id FROM categories WHERE name = 'Desserts'), 'Rich chocolate cake'),
  ('Lemonade', 'DRK-001', 2.99, (SELECT id FROM categories WHERE name = 'Drinks'), 'Fresh lemonade');

-- TABLES
INSERT INTO tables (number, name, capacity, status) VALUES
  ('1', 'Window', 4, 'available'),
  ('2', 'Patio', 2, 'available'),
  ('3', 'Booth', 6, 'available'),
  ('4', 'Bar', 2, 'available');

-- CUSTOMERS
INSERT INTO customers (first_name, last_name, email, phone) VALUES
  ('John', 'Doe', 'john@example.com', '555-1234'),
  ('Jane', 'Smith', 'jane@example.com', '555-5678'); 