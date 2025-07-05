import { Router } from 'express';
import { query } from '../database/connection';
import { requireRole } from '../middleware/auth';
import { UserRole } from '@resto/shared';

const router = Router();

router.get('/events', async (req, res) => {
  try {
    const { lastSync, limit = 100 } = req.query;
    
    let sql = 'SELECT * FROM sync_events WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (lastSync) {
      sql += ` AND created_at > $${paramIndex}`;
      params.push(lastSync);
      paramIndex++;
    }

    sql += ' ORDER BY created_at ASC';
    sql += ` LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching sync events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sync events',
    });
  }
});

router.post('/events', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { tableName, recordId, action, data } = req.body;

    const result = await query(
      `INSERT INTO sync_events (table_name, record_id, action, data, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [tableName, recordId, action, JSON.stringify(data)]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Sync event created successfully',
    });
  } catch (error) {
    console.error('Error creating sync event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sync event',
    });
  }
});

router.delete('/events/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.MANAGER]), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM sync_events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sync event not found',
      });
    }

    res.json({
      success: true,
      message: 'Sync event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sync event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sync event',
    });
  }
});

export default router; 