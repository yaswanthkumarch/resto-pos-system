import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { orderId, method, status } = req.query;
    let sql = `
      SELECT p.*, o.order_number, u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (orderId) {
      sql += ` AND p.order_id = $${paramIndex}`;
      params.push(orderId);
      paramIndex++;
    }

    if (method) {
      sql += ` AND p.method = $${paramIndex}`;
      params.push(method);
      paramIndex++;
    }

    if (status) {
      sql += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { orderId, amount, method, transactionId, reference, createdBy, status } = req.body;

    const paymentStatus = status || 'pending';
    const result = await query(
      `INSERT INTO payments (order_id, amount, method, status, transaction_id, reference, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [orderId, amount, method, paymentStatus, transactionId, reference, createdBy]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Payment created successfully',
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment',
    });
  }
});

router.put('/:id/status', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE payments 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Payment status updated successfully',
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment status',
    });
  }
});

export default router; 