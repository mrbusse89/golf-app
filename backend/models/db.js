const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'golf_app',
});

let initialized = false;

/**
 * Initialize PostgreSQL and load schema
 * @returns {Promise<void>}
 */
async function getDb() {
  if (initialized) return;

  try {
    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('[DB] Connected to PostgreSQL');

    // Run schema if needed
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await pool.query(schema);
      console.log('[DB] Schema initialized');
    }

    initialized = true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    throw err;
  }
}

/**
 * Run a SQL statement (INSERT/UPDATE/DELETE) with params
 * @param {string} sql
 * @param {any[]} params
 * @returns {Promise<{ changes: number, lastId: number }>}
 */
async function run(sql, params = []) {
  const result = await pool.query(sql, params);
  const lastId = result.rows[0]?.id || 0;
  return { changes: result.rowCount, lastId };
}

/**
 * Get a single row
 * @param {string} sql
 * @param {any[]} params
 * @returns {Promise<object|null>}
 */
async function get(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

/**
 * Get all matching rows
 * @param {string} sql
 * @param {any[]} params
 * @returns {Promise<object[]>}
 */
async function all(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

module.exports = { getDb, run, get, all };