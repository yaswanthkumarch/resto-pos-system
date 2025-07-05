import { Pool, PoolClient } from 'pg';
import { config } from '../config';
import { logger } from '../utils/logger';

let pool: Pool;

export const connectDatabase = async (): Promise<void> => {
  try {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
      max: 25,
      min: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('connect', (client) => {
      logger.info('Database connection established');
      client.query('SET SESSION statement_timeout = 30000');
      client.query('SET SESSION idle_in_transaction_session_timeout = 60000');
    });

    pool.on('error', (err) => {
      logger.error('Database connection error:', err);
    });

    pool.on('acquire', (client) => {
      logger.debug('Client acquired from pool');
    });

    pool.on('release', (client) => {
      logger.debug('Client released to pool');
    });

    await pool.connect();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool;
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const transaction = async (queries: Array<{ text: string; params?: any[] }>): Promise<any[]> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}; 