const pool = require('../config/database').pool;

const userModel = {
    // Mendapatkan semua users
    getUsers: async () => {
        const result = await pool.query('SELECT user_id, email, role, is_active, created_at, updated_at FROM users');
        return result.rows;
    },
    
    // Mendapatkan user berdasarkan email
    getUserByEmail: async (email) => {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return res.rows[0];
    },
    
    // Mendapatkan user berdasarkan ID
    getUserById: async (userId) => {
        const res = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        return res.rows[0];
    },
    
    // Membuat user baru (sign up)
    createUser: async (email, password_hash, role = 'admin') => {
        const res = await pool.query('INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, password_hash, role, created_at', [email, password_hash, role]);
        return res.rows[0];
    },

    // Toggle user active status
    toggleUserStatus: async (userId) => {
        if (!userId) throw new Error('User ID is required');

        const result = await pool.query(
            'UPDATE users SET is_active = NOT is_active WHERE user_id = $1 RETURNING user_id, email, role, is_active',
            [userId]
        );

        if (!result.rows[0]) {
            throw new Error('User not found');
        }

        return result.rows[0];
    },

};

module.exports = userModel;