import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { config } from '../config';

const pool = new Pool({
  connectionString: config.database.url,
});

async function fixAdminUser() {
  try {
    console.log('Fixing admin user password...');

    // Generate a proper bcrypt hash for 'admin123'
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('Generated password hash:', passwordHash);

    // First, let's check if admin user exists
    const checkResult = await pool.query(
      'SELECT id, username, password FROM users WHERE username = $1',
      ['admin']
    );

    if (checkResult.rows.length === 0) {
      console.log('Admin user does not exist. Creating new admin user...');
      
      // Create new admin user
      await pool.query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
        ['admin', 'admin@restaurant.com', passwordHash, 'Admin', 'User', 'SUPER_ADMIN']
      );
      
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user exists. Updating password hash...');
      
      // Update existing admin user
      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE username = $2',
        [passwordHash, 'admin']
      );
      
      console.log('Admin user password updated successfully!');
    }

    // Verify the update
    const verifyResult = await pool.query(
      'SELECT username, password FROM users WHERE username = $1',
      ['admin']
    );

    if (verifyResult.rows.length > 0) {
      console.log('Verification successful!');
      console.log('Username:', verifyResult.rows[0].username);
      console.log('Password hash exists:', !!verifyResult.rows[0].password);
    }

    console.log('\n✅ Admin user is now ready!');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error fixing admin user:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixAdminUser(); 