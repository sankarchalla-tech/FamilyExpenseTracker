const { Pool } = require('pg');

// Try different PostgreSQL configurations
const configs = [
  'postgresql://postgres@localhost:5432/postgres',  // No password, default db
  'postgresql://postgres:postgres@localhost:5432/postgres',
  'postgresql://postgres:password@localhost:5432/postgres',
  'postgresql://postgres:@localhost:5432/postgres',
  'postgresql://postgres:admin@localhost:5432/postgres',
];

async function testConnection() {
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`Trying config ${i + 1}: ${config.replace(/:.*@/, ':***@')}`);
    
    const pool = new Pool({ connectionString: config });
    try {
      const result = await pool.query('SELECT version()');
      console.log('✅ SUCCESS! Connected with config:', config);
      console.log('PostgreSQL version:', result.rows[0].version);
      
      // Test creating our database
      await pool.query('CREATE DATABASE family_expense_tracker');
      console.log('✅ Database created successfully');
      
      await pool.end();
      return config;
    } catch (error) {
      console.log('❌ Failed:', error.message);
      await pool.end();
    }
  }
  throw new Error('No working configuration found');
}

testConnection()
  .then(workingConfig => {
    console.log('\n🎉 Working configuration found:');
    console.log(workingConfig);
    
    // Update .env file
    const fs = require('fs');
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${workingConfig.replace('/postgres', '/family_expense_tracker')}`);
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file updated with working configuration');
  })
  .catch(error => {
    console.error('\n❌ No working configuration found. You may need to:');
    console.log('1. Install/configure PostgreSQL');
    console.log('2. Set up a password for the postgres user');
    console.log('3. Check if PostgreSQL is running: sudo systemctl status postgresql');
  });