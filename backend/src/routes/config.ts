import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const result = await query('SELECT * FROM config LIMIT 1');
    res.json({
      success: true,
      data: result.rows[0] || {},
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch config',
    });
  }
});

router.put('/', requireRole([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const { storeName, address, phone, email, currency, taxRate, timezone } = req.body;
    const result = await query(
      `UPDATE config SET 
        store_name = $1, address = $2, phone = $3, email = $4, currency = $5, tax_rate = $6, timezone = $7, updated_at = NOW()
       RETURNING *`,
      [storeName, address, phone, email, currency, taxRate, timezone]
    );
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Config updated successfully',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update config',
    });
  }
});

export default router; 