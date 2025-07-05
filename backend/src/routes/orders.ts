import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

// Get all orders with enhanced details
router.get('/', async (req, res) => {
  try {
    const { status, tableId, customerId, date } = req.query;
    let sql = `
      SELECT 
        o.*,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name, 
        c.email as customer_email, 
        c.phone as customer_phone,
        t.number as table_number, 
        t.name as table_name,
        u.username as created_by_user,
        oi.id as item_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.notes as item_notes,
        p.name as product_name,
        p.sku as product_sku
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tableId) {
      sql += ` AND o.table_id = $${paramIndex}`;
      params.push(tableId);
      paramIndex++;
    }

    if (customerId) {
      sql += ` AND o.customer_id = $${paramIndex}`;
      params.push(customerId);
      paramIndex++;
    }

    if (date) {
      sql += ` AND DATE(o.created_at) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    sql += ' ORDER BY o.created_at DESC, oi.id';

    const result = await query(sql, params);

    const ordersMap = new Map();
    
    result.rows.forEach((row: any) => {
      const orderId = row.id;
      
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id,
          order_number: row.order_number,
          customer_id: row.customer_id,
          customer_name: row.customer_name,
          customer_email: row.customer_email,
          customer_phone: row.customer_phone,
          table_id: row.table_id,
          table_number: row.table_number,
          table_name: row.table_name,
          subtotal: row.subtotal,
          tax: row.tax,
          discount: row.discount,
          total: row.total,
          status: row.status,
          payment_status: row.payment_status,
          notes: row.notes,
          created_at: row.created_at,
          updated_at: row.updated_at,
          created_by_user: row.created_by_user,
          items: []
        });
      }
      
      if (row.item_id) {
        const order = ordersMap.get(orderId);
        order.items.push({
          id: row.item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total_price: row.total_price,
          notes: row.item_notes,
          product_name: row.product_name,
          product_sku: row.product_sku
        });
      }
    });

    const orders = Array.from(ordersMap.values());

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
    });
  }
});

// Get order by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT 
        o.*,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name, 
        c.email as customer_email, 
        c.phone as customer_phone,
        t.number as table_number, 
        t.name as table_name,
        u.username as created_by_user,
        oi.id as item_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.notes as item_notes,
        p.name as product_name,
        p.sku as product_sku
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN tables t ON o.table_id = t.id
       LEFT JOIN users u ON o.created_by = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1
       ORDER BY oi.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const order: any = {
      id: result.rows[0].id,
      order_number: result.rows[0].order_number,
      customer_id: result.rows[0].customer_id,
      customer_name: result.rows[0].customer_name,
      customer_email: result.rows[0].customer_email,
      customer_phone: result.rows[0].customer_phone,
      table_id: result.rows[0].table_id,
      table_number: result.rows[0].table_number,
      table_name: result.rows[0].table_name,
      subtotal: result.rows[0].subtotal,
      tax: result.rows[0].tax,
      discount: result.rows[0].discount,
      total: result.rows[0].total,
      status: result.rows[0].status,
      payment_status: result.rows[0].payment_status,
      notes: result.rows[0].notes,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      created_by_user: result.rows[0].created_by_user,
      items: []
    };

    result.rows.forEach((row: any) => {
      if (row.item_id) {
        order.items.push({
          id: row.item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total_price: row.total_price,
          notes: row.item_notes,
          product_name: row.product_name,
          product_sku: row.product_sku
        });
      }
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order',
    });
  }
});

// Create new order with enhanced support
router.post('/', async (req, res) => {
  const client = await query('BEGIN');
  
  try {
    const { 
      customer_id, 
      table_id, 
      items, 
      total, 
      subtotal = 0,
      tax = 0,
      discount = 0,
      status = 'pending',
      type = 'dine_in',
      notes,
      payment_status = 'pending',
      payment_method
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item',
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Order total must be greater than 0',
      });
    }

    // Generate order number
    const orderNumberResult = await query('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURRENT_DATE');
    const todayCount = parseInt(orderNumberResult.rows[0].count) + 1;
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${todayCount.toString().padStart(3, '0')}`;

    // Create main order
    const orderResult = await query(
      `INSERT INTO orders (order_number, customer_id, table_id, subtotal, tax, discount, total, status, type, notes, payment_status, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [orderNumber, customer_id, table_id, subtotal, tax, discount, total, status, type, notes, payment_status, (req as any).user?.id]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.quantity, item.price, item.price * item.quantity, item.notes]
      );
    }

    // Update table status if table is assigned
    if (table_id) {
      await query(
        `UPDATE tables SET status = 'occupied', updated_at = NOW() WHERE id = $1`,
        [table_id]
      );
    }

    // Create payment record if payment method is provided
    if (payment_method && payment_status === 'paid') {
      await query(
        `INSERT INTO payments (order_id, amount, method, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [order.id, total, payment_method, payment_status, (req as any).user?.id]
      );
    }

    await query('COMMIT');

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

// Update order (for modifications)
router.put('/:id', async (req, res) => {
  const client = await query('BEGIN');
  
  try {
    const { id } = req.params;
    const { 
      customer_id, 
      table_id, 
      items, 
      total, 
      subtotal = 0,
      tax = 0,
      discount = 0,
      status, 
      notes 
    } = req.body;

    // Get current order to check table assignment
    const currentOrder = await query('SELECT table_id FROM orders WHERE id = $1', [id]);
    if (currentOrder.rows.length === 0) {
      throw new Error('Order not found');
    }

    const oldTableId = currentOrder.rows[0].table_id;

    // Update order
    const result = await query(
      `UPDATE orders 
       SET customer_id = $1, table_id = $2, subtotal = $3, tax = $4, 
           discount = $5, total = $6, status = $7, notes = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [customer_id, table_id, subtotal, tax, discount, total, status, notes, id]
    );

    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    // Update order items
    await query('DELETE FROM order_items WHERE order_id = $1', [id]);
    
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, item.product_id, item.quantity, item.price, item.price * item.quantity, item.notes]
      );
    }

    // Update table statuses
    if (oldTableId && oldTableId !== table_id) {
      // Free up old table
      await query(
        `UPDATE tables SET status = 'available', updated_at = NOW() WHERE id = $1`,
        [oldTableId]
      );
    }
    
    if (table_id && table_id !== oldTableId) {
      // Occupy new table
      await query(
        `UPDATE tables SET status = 'occupied', updated_at = NOW() WHERE id = $1`,
        [table_id]
      );
    }

    await query('COMMIT');

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Order updated successfully',
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
    });
  }
});

// Update order payment status
router.patch('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_method } = req.body;
    if (!payment_status) {
      return res.status(400).json({
        success: false,
        error: 'payment_status is required',
      });
    }
    
    // Update order payment status
    const result = await query(
      `UPDATE orders SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [payment_status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // If payment_method is provided and payment_status is 'paid', create a payment record
    if (payment_method && payment_status === 'paid') {
      const tokenPayload = JSON.parse(atob((req as any).headers.authorization?.split(' ')[1]?.split('.')[1] || '{}'));
      const userId = tokenPayload.id;
      
      await query(
        `INSERT INTO payments (order_id, amount, method, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [id, result.rows[0].total, payment_method, payment_status, userId]
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Order payment status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order payment status',
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Update table status if order is completed
    if (status === 'completed' && result.rows[0].table_id) {
      await query(
        `UPDATE tables SET status = 'available', updated_at = NOW() WHERE id = $1`,
        [result.rows[0].table_id]
      );
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Order status updated successfully',
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
    });
  }
});

// Delete order
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  const client = await query('BEGIN');
  
  try {
    const { id } = req.params;

    // Get order details for table cleanup
    const orderResult = await query('SELECT table_id FROM orders WHERE id = $1', [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    const tableId = orderResult.rows[0].table_id;

    // Delete order items
    await query('DELETE FROM order_items WHERE order_id = $1', [id]);

    // Delete order
    await query('DELETE FROM orders WHERE id = $1', [id]);

    // Update table status if needed
    if (tableId) {
      await query(
        `UPDATE tables SET status = 'available', updated_at = NOW() WHERE id = $1`,
        [tableId]
      );
    }

    await query('COMMIT');

    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    await query('ROLLBACK');
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order',
    });
  }
});

export default router; 