import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

// Get all tables
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*, 
             o.id as current_order_id,
             o.status as order_status,
             o.total as order_total,
             o.created_at as order_created_at
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ('pending', 'preparing')
      ORDER BY t.number
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tables',
    });
  }
});

// Get table by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT * FROM tables WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch table',
    });
  }
});

// Create new table
router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { number, name, capacity, status } = req.body;

    const result = await query(
      `INSERT INTO tables (number, name, capacity, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [number, name, capacity, status || 'available']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Table created successfully',
    });
  } catch (error) {
    console.error('Error creating table:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create table';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Update table
router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { number, name, capacity, status } = req.body;

    const result = await query(
      `UPDATE tables 
       SET number = $1, name = $2, capacity = $3, status = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [number, name, capacity, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Table updated successfully',
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update table',
    });
  }
});

// Delete table
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM tables WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    res.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete table',
    });
  }
});

// Update table status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE tables SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Table not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Table status updated successfully',
    });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update table status',
    });
  }
});

export default router; 