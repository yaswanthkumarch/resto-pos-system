import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const [ordersResult, salesResult, productsResult, customersResult] = await Promise.all([
      query("SELECT COUNT(*) as total_orders FROM orders WHERE created_at >= NOW() - INTERVAL '1 day'"),
      query("SELECT COALESCE(SUM(total), 0) as total_sales FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '1 day'"),
      query("SELECT COUNT(*) as total_products FROM products WHERE is_active = true"),
      query("SELECT COUNT(*) as total_customers FROM customers WHERE is_active = true")
    ]);

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(ordersResult.rows[0].total_orders),
        totalSales: parseFloat(salesResult.rows[0].total_sales),
        totalProducts: parseInt(productsResult.rows[0].total_products),
        totalCustomers: parseInt(customersResult.rows[0].total_customers),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

export default router; 