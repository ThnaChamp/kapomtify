const { Pool } = require('pg');
require('dotenv').config();
console.log('Checking DB_PASSWORD:',process.env.DB_PASSWORD);
const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL via Pool');
});
module.exports = pool;