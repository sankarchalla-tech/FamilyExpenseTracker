const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // for development purposes; adjust as needed for production
  },
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Initializing database schema...');
    await client.query(schema);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

initializeDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));