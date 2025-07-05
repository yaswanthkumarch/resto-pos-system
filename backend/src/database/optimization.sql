-- Database Optimization Scripts
-- Run these scripts to improve query performance

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status_created_at ON orders(payment_status, created_at DESC);

-- Indexes for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id_product_id ON order_items(order_id, product_id);

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);

-- Indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

-- Indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);

-- Indexes for tables table
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_number ON tables(number);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_composite_status_date ON orders(status, created_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_products_composite_category_active ON products(category_id, is_active, name);
CREATE INDEX IF NOT EXISTS idx_customers_composite_active_name ON customers(is_active, first_name, last_name);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(id) WHERE status IN ('pending', 'preparing', 'ready');
CREATE INDEX IF NOT EXISTS idx_products_active ON products(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(id) WHERE is_active = true;

-- Analyze tables to update statistics
ANALYZE orders;
ANALYZE order_items;
ANALYZE products;
ANALYZE categories;
ANALYZE customers;
ANALYZE tables;
ANALYZE payments;
ANALYZE users; 