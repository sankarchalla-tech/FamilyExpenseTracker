const { pool } = require('./config/db');

async function testUserCreation() {
  console.log('Testing user creation and lookup...');
  
  try {
    // Check existing users
    const allUsers = await pool.query('SELECT id, name, email, username, password_hash FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('Recent users:', allUsers.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      hasPasswordHash: !!u.password_hash,
      passwordHashLength: u.password_hash ? u.password_hash.length : 0
    })));

    // Test creating a user manually
    console.log('\nTesting manual user creation...');
    const bcrypt = require('bcryptjs');
    const testPassword = 'password123';
    const hash = await bcrypt.hash(testPassword, 10);
    console.log('Test hash:', hash.substring(0, 20) + '...');
    
    // Test password comparison
    const isValid = await bcrypt.compare(testPassword, hash);
    console.log('Password comparison test:', isValid);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    process.exit(0);
  }
}

testUserCreation();