import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    let sql = `
      SELECT p.id, p.name, p.description, p.sku, p.price::numeric as price, p.cost, p.has_variants, p.stock_quantity, p.low_stock_threshold, p.is_active, p.created_at, p.updated_at, c.name as category_name, c.color as category_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (categoryId) {
      sql += ` AND p.category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY c.sort_order, p.name';

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.id, p.name, p.description, p.sku, p.price::numeric as price, p.cost, p.has_variants, p.stock_quantity, p.low_stock_threshold, p.is_active, p.created_at, p.updated_at, c.name as category_name, c.color as category_color
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const product = result.rows[0];

    if (product.has_variants) {
      const variantsResult = await query(
        'SELECT * FROM product_variants WHERE product_id = $1 AND is_active = true',
        [id]
      );
      product.variants = variantsResult.rows;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
    });
  }
});

router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { name, description, sku, categoryId, price, cost, hasVariants, stockQuantity, lowStockThreshold } = req.body;

    const result = await query(
      `INSERT INTO products (name, description, sku, category_id, price, cost, has_variants, stock_quantity, low_stock_threshold, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
       RETURNING *`,
      [name, description, sku, categoryId, price, cost, hasVariants, stockQuantity, lowStockThreshold]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
    });
  }
});

router.put('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, sku, categoryId, price, cost, hasVariants, stockQuantity, lowStockThreshold, isActive } = req.body;

    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, sku = $3, category_id = $4, price = $5, cost = $6, 
           has_variants = $7, stock_quantity = $8, low_stock_threshold = $9, is_active = $10, updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [name, description, sku, categoryId, price, cost, hasVariants, stockQuantity, lowStockThreshold, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
    });
  }
});

router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
    });
  }
});

export default router; 