-- Fix invalid order status values
-- Change 'in_progress' to 'preparing' to match the enum definition

UPDATE orders 
SET status = 'preparing' 
WHERE status = 'in_progress';

-- Verify the fix
SELECT COUNT(*) as orders_with_invalid_status 
FROM orders 
WHERE status = 'in_progress'; 