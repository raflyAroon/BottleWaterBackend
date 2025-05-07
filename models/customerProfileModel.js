const pool = require('../config/database').pool;

const customerProfileModel = {
    // Menambahkan fungsi baru untuk mendapatkan user_id dari email
    getUserIdByEmail: async (email) => {
        if (!email) throw new Error('Email is required');
        
        const result = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [email]
        );
        if (!result.rows[0]) {
            throw new Error('User tidak ditemukan');
        }
        return result.rows[0].user_id;
    },

    // Get all customer profiles with user information
    getAllCustomerProfiles: async () => {
        const result = await pool.query(
            'SELECT cp.customer_id, cp.user_id, cp.full_name, cp.phone, cp.address::jsonb, cp.delivery_instructions, ' +
            'u.email, u.role, u.is_active ' +
            'FROM customer_profiles cp ' +
            'INNER JOIN users u ON cp.user_id = u.user_id'
        );
        return result.rows;
    },

    getCustomerProfileByEmailUser: async (email) => {
        if (!email) throw new Error('Email is required');
        
        const result = await pool.query(
            'SELECT cp.customer_id, cp.user_id, cp.full_name, cp.phone, cp.address::jsonb, cp.delivery_instructions, ' +
            'u.email, u.role, u.is_active ' +
            'FROM customer_profiles cp ' +
            'INNER JOIN users u ON cp.user_id = u.user_id ' +
            'WHERE u.email = $1',
            [email]
        );
        return result.rows[0] || null;
    },
    
    // Get customer profile by user_id with user information
    // This will be used primarily with the authenticated user's ID
    getCustomerProfileByUserId: async (user_id) => {
        if (!user_id) throw new Error('User ID is required');
        
        const result = await pool.query(
            'SELECT cp.customer_id, cp.user_id, cp.full_name, cp.phone, cp.address::jsonb, cp.delivery_instructions, ' +
            'u.email, u.role, u.is_active ' +
            'FROM customer_profiles cp ' +
            'INNER JOIN users u ON cp.user_id = u.user_id ' +
            'WHERE cp.user_id = $1',
            [user_id]
        );
        return result.rows[0] || null;
    },

    // Create customer profile
    // The user_id is passed from the authenticated session
    createCustomerProfile: async (userData) => {
        const { user_id, full_name, phone, address, delivery_instructions } = userData;
        
        if (!user_id) throw new Error('User ID is required');

        // Check if user exists
        const userExists = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [user_id]);
        if (!userExists.rows[0]) {
            throw new Error('User tidak ditemukan');
        }

        // Check if profile already exists
        const existingProfile = await pool.query(
            'SELECT customer_id FROM customer_profiles WHERE user_id = $1',
            [user_id]
        );
        if (existingProfile.rows[0]) {
            throw new Error('Customer profile sudah ada untuk user ini');
        }

        // Validate address format
        const addressObject = typeof address === 'string' ? JSON.parse(address) : address;
        const requiredFields = ['negara', 'provinsi', 'kota', 'kabupaten', 'kelurahan', 'jalan'];
        for (const field of requiredFields) {
            if (!addressObject[field]) {
                throw new Error(`Field ${field} harus diisi dalam address`);
            }
        }

        const result = await pool.query(
            'INSERT INTO customer_profiles (user_id, full_name, phone, address, delivery_instructions) ' +
            'VALUES ($1, $2, $3, $4::jsonb, $5) ' +
            'RETURNING customer_id, user_id, full_name, phone, address::jsonb, delivery_instructions',
            [user_id, full_name, phone, JSON.stringify(addressObject), delivery_instructions]
        );
        return result.rows[0];
    },

    // Update customer profile
    // The user_id is passed from the authenticated session
    updateCustomerProfile: async (userData) => {
        const { user_id, full_name, phone, address, delivery_instructions } = userData;
        
        if (!user_id) throw new Error('User ID is required');

        // Validate user exists
        const userExists = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [user_id]);
        if (!userExists.rows[0]) {
            throw new Error('User tidak ditemukan');
        }

        // Check if profile exists
        const existingProfile = await pool.query(
            'SELECT customer_id FROM customer_profiles WHERE user_id = $1',
            [user_id]
        );
        if (!existingProfile.rows[0]) {
            // If profile doesn't exist, create one instead
            return customerProfileModel.createCustomerProfile(userData);
        }

        // Ensure address is in correct JSONB format
        const addressObject = typeof address === 'string' ? JSON.parse(address) : address;
        
        // Validate address structure
        const requiredFields = ['negara', 'provinsi', 'kota', 'kabupaten', 'kelurahan', 'jalan'];
        for (const field of requiredFields) {
            if (!addressObject[field]) {
                throw new Error(`Field ${field} harus diisi dalam address`);
            }
        }

        const result = await pool.query(
            'UPDATE customer_profiles SET full_name = $2, phone = $3, address = $4::jsonb, delivery_instructions = $5 ' +
            'WHERE user_id = $1 ' +
            'RETURNING customer_id, user_id, full_name, phone, address::jsonb, delivery_instructions',
            [user_id, full_name, phone, JSON.stringify(addressObject), delivery_instructions]
        );
        return result.rows[0];
    },

    // Utility method to create or update profile (upsert)
    // This will be used in the controller to simplify the profile management
    upsertCustomerProfile: async (userData) => {
        const { user_id } = userData;
        
        if (!user_id) throw new Error('User ID is required');

        const existingProfile = await customerProfileModel.getCustomerProfileByUserId(user_id);
        
        if (existingProfile) {
            return customerProfileModel.updateCustomerProfile(userData);
        } else {
            return customerProfileModel.createCustomerProfile(userData);
        }
    }
};

module.exports = customerProfileModel;