import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/sales', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as total_sales,
        SUM(tax) as total_tax,
        SUM(subtotal) as total_subtotal
      FROM orders 
      WHERE status = 'completed'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (groupBy === 'day') {
      sql += ' GROUP BY DATE(created_at)';
    } else if (groupBy === 'week') {
      sql += ' GROUP BY DATE_TRUNC(\'week\', created_at)';
    } else if (groupBy === 'month') {
      sql += ' GROUP BY DATE_TRUNC(\'month\', created_at)';
    }

    sql += ' ORDER BY date DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate sales report',
    });
  }
});

router.get('/products', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let sql = `
      SELECT 
        p.name as product_name,
        p.sku as product_sku,
        c.name as category_name,
        COUNT(oi.id) as times_ordered,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      sql += ` AND o.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND o.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    sql += ' GROUP BY p.id, p.name, p.sku, c.name';
    sql += ' ORDER BY total_revenue DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error generating product report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate product report',
    });
  }
});

router.get('/inventory', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.name as product_name,
        p.sku as product_sku,
        c.name as category_name,
        p.stock_quantity,
        p.low_stock_threshold,
        CASE 
          WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low'
          WHEN p.stock_quantity = 0 THEN 'out'
          ELSE 'normal'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY stock_status DESC, p.name
    `;

    const result = await query(sql);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate inventory report',
    });
  }
});

export default router; 