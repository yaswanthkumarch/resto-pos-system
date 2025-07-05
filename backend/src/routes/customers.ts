import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let sql = 'SELECT * FROM customers WHERE is_active = true';
    const params: any[] = [];

    if (search) {
      sql += ' AND (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    const countResult = await query(
      'SELECT COUNT(*) as total FROM customers WHERE is_active = true',
      []
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM customers WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;

    const result = await query(
      `INSERT INTO customers (first_name, last_name, email, phone, address, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING *`,
      [firstName, lastName, email, phone, address]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, isActive } = req.body;

    const result = await query(
      `UPDATE customers 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5, is_active = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [firstName, lastName, email, phone, address, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Customer updated successfully',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer',
    });
  }
});

export default router; 