import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.database.url,
});

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    const schemaPath = join(__dirname, '../../../database/schema.sql');
    const seedPath = join(__dirname, '../database/seed.sql');

    const schema = readFileSync(schemaPath, 'utf8');
    const seed = readFileSync(seedPath, 'utf8');

    console.log('Running schema...');
    await pool.query(schema);
    console.log('Schema applied successfully');

    console.log('Running seed data...');
    await pool.query(seed);
    console.log('Seed data applied successfully');

    console.log('Database setup completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 