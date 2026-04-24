// Simple MySQL Database Helper - No Prisma!
const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Execute query - returns results or throws error
async function query(sql, values = []) {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(sql, values);
    connection.release();
    return results;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Find one record
async function findOne(table, where = {}) {
  const keys = Object.keys(where);
  const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
  const values = keys.map(key => where[key]);
  
  const sql = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const results = await query(sql, values);
  return results.length > 0 ? results[0] : null;
}

// Find all records
async function findMany(table, where = {}, limit = null) {
  const keys = Object.keys(where);
  const whereClause = keys.length > 0 ? `WHERE ${keys.map(key => `${key} = ?`).join(' AND ')}` : '';
  const values = keys.map(key => where[key]);
  
  let sql = `SELECT * FROM ${table} ${whereClause}`;
  if (limit) sql += ` LIMIT ${limit}`;
  
  return await query(sql, values);
}

// Create record
async function create(table, data) {
  const keys = Object.keys(data);
  const values = keys.map(key => data[key]);
  const placeholders = keys.map(() => '?').join(',');
  
  const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`;
  await query(sql, values);
  
  // Return the created record with auto-generated id
  return { id: null, ...data };
}

// Update record
async function update(table, data, where = {}) {
  const updateKeys = Object.keys(data);
  const updateValues = updateKeys.map(key => data[key]);
  const updateClause = updateKeys.map(key => `${key} = ?`).join(',');
  
  const whereKeys = Object.keys(where);
  const whereValues = whereKeys.map(key => where[key]);
  const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `UPDATE ${table} SET ${updateClause} WHERE ${whereClause}`;
  const allValues = [...updateValues, ...whereValues];
  
  await query(sql, allValues);
}

// Delete record
async function deleteRecord(table, where = {}) {
  const keys = Object.keys(where);
  const values = keys.map(key => where[key]);
  const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  await query(sql, values);
}

module.exports = {
  query,
  findOne,
  findMany,
  create,
  update,
  deleteRecord,
  pool,
};
