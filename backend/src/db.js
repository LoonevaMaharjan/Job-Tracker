const { Pool } = require('pg');
require('dotenv').config();

// A "pool" manages multiple database connections efficiently
// instead of opening/closing a new one for every request
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on database connection', err);
});

module.exports = pool;