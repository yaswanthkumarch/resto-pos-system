import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.database.url,
});

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    const seedPath = join(__dirname, '../../../database/seed.sql');
    const seed = readFileSync(seedPath, 'utf8');

    console.log('Running seed data...');
    await pool.query(seed);
    console.log('Seed data applied successfully');

    console.log('Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase(); 