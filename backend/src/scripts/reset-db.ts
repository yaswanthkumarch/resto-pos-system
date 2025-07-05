import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.database.url.replace('/resto_pos', '/postgres'),
});

async function resetDatabase() {
  try {
    console.log('Dropping existing database...');
    await pool.query('DROP DATABASE IF EXISTS resto_pos');
    console.log('Database dropped successfully');

    console.log('Creating new database...');
    await pool.query('CREATE DATABASE resto_pos');
    console.log('Database created successfully');

  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetDatabase(); 