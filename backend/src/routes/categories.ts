import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name'
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM categories WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
    });
  }
});

router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { name, description, color, sortOrder } = req.body;

    const result = await query(
      `INSERT INTO categories (name, description, color, sort_order, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())
       RETURNING *`,
      [name, description, color, sortOrder || 0]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Category created successfully',
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
    });
  }
});

router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, sortOrder, isActive } = req.body;

    const result = await query(
      `UPDATE categories 
       SET name = $1, description = $2, color = $3, sort_order = $4, is_active = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, description, color, sortOrder, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Category updated successfully',
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
    });
  }
});

router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    
    const productsResult = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
      [id]
    );

    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing products',
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
    });
  }
});

export default router; 