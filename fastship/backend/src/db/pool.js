const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fastship',
  user:     process.env.DB_USER || 'fastship_user',
  password: process.env.DB_PASS || 'fastship_pass_2024',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('DB pool error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
