const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
// Load from root env
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function run() {
  console.log('Loading database config...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true,
  });

  const sqlPath = path.join(__dirname, 'blog_table.sql');
  console.log(`Reading SQL file from ${sqlPath}...`);
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Executing SQL statements...');
  const [result] = await pool.query(sql);
  console.log('Migration completed successfully!');
  await pool.end();
}

run().catch((err) => {
  console.error('Error running migration:', err);
  process.exit(1);
});
