import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.database.url,
});

async function cleanDatabase() {
  try {
    console.log('Cleaning database...');

    // Drop all tables in the correct order
    const dropQueries = [
      'DROP TABLE IF EXISTS sync_events CASCADE',
      'DROP TABLE IF EXISTS payments CASCADE',
      'DROP TABLE IF EXISTS order_items CASCADE',
      'DROP TABLE IF EXISTS orders CASCADE',
      'DROP TABLE IF EXISTS tables CASCADE',
      'DROP TABLE IF EXISTS customers CASCADE',
      'DROP TABLE IF EXISTS product_variants CASCADE',
      'DROP TABLE IF EXISTS products CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS config CASCADE',
    ];

    for (const query of dropQueries) {
      await pool.query(query);
    }

    // Drop enum types
    const dropEnums = [
      'DROP TYPE IF EXISTS user_role CASCADE',
      'DROP TYPE IF EXISTS order_status CASCADE',
      'DROP TYPE IF EXISTS order_type CASCADE',
      'DROP TYPE IF EXISTS payment_status CASCADE',
      'DROP TYPE IF EXISTS payment_method CASCADE',
      'DROP TYPE IF EXISTS table_status CASCADE',
      'DROP TYPE IF EXISTS sync_event_type CASCADE',
      'DROP TYPE IF EXISTS sync_action CASCADE',
    ];

    for (const query of dropEnums) {
      await pool.query(query);
    }

    console.log('Database cleaned successfully');

    // Now run the schema
    const schemaPath = join(__dirname, '../../../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('Running schema...');
    await pool.query(schema);
    console.log('Schema applied successfully');

    // Run seed data
    const seedPath = join(__dirname, '../database/seed.sql');
    const seed = readFileSync(seedPath, 'utf8');

    console.log('Running seed data...');
    await pool.query(seed);
    console.log('Seed data applied successfully');

    console.log('Database setup completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanDatabase(); 