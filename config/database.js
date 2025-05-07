const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    server: process.env.PGSERVER || '127.0.0.1',
    database: process.env.PGDATABASE || 'bottlewaterdelivery',
    password: process.env.PGPASSWORD || 'Raflylaisa3019',
    port: parseInt(process.env.PGPORT || '3019'),
    connectionTimeoutMillis: 5000, // 5 detik timeout
});

// Tes koneksi dengan segera
const testConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Database connection successful');
        return true;
    } catch (err) {
        console.error('Database connection error:', err.message);
        return false;
    }
};

module.exports = { pool, testConnection };