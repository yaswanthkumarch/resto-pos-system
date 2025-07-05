import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at, last_login_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

router.get('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at, last_login_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
});

router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, isActive } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, role = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, username, email, first_name, last_name, role, is_active, created_at, updated_at`,
      [firstName, lastName, email, role, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
});

router.delete('/:id', requireRole([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
});

export default router; 