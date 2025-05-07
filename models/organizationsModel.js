const pool = require('../config/database').pool;

const orgProfileModel = {
    // Get user_id from email
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

    // Get all organization profiles with user information
    getAllOrgProfiles: async () => {
        const result = await pool.query(
            `SELECT op.org_id, op.user_id, op.org_name, op.contact_person, op.contact_phone_org, op.org_type, op.created_at, op.updated_at, ` +
            `u.email, u.role, u.is_active ` +
            `FROM public.organizations_profiles op ` +
            `INNER JOIN users u ON op.user_id = u.user_id`
        );
        return result.rows;
    },
    
    // Get organization profile by email with user information
    getOrgProfileByEmailUser: async (email) => {
        if (!email) throw new Error('Email is required');
        
        const result = await pool.query(
            `SELECT op.org_id, op.user_id, op.org_name, op.contact_person, op.contact_phone_org, op.org_type, op.created_at, op.updated_at, ` +
            `u.email, u.role, u.is_active ` +
            `FROM public.organizations_profiles op ` +
            `INNER JOIN users u ON op.user_id = u.user_id ` +
            `WHERE u.email = $1`,
            [email]
        );
        return result.rows[0] || null;
    },
    
    // Get organization profile by user_id with user information
    getOrgProfileByUserId: async (user_id) => {
        if (!user_id) throw new Error('User ID is required');
        
        const result = await pool.query(
            `SELECT op.org_id, op.user_id, op.org_name, op.contact_person, op.contact_phone_org, op.org_type, op.created_at, op.updated_at
             FROM organizations_profiles op 
             WHERE op.user_id = $1`,
            [user_id]
        );
        
        console.log('Query result:', result.rows[0]);
        return result.rows[0] || null;
    },

    // Create organization profile
    createOrgProfile: async (orgData) => {
        const { user_id, org_name, contact_person, contact_phone_org, org_type } = orgData;
        
        if (!user_id) throw new Error('User ID is required');

        // Check if user exists
        const userExists = await pool.query(
            `SELECT user_id FROM users WHERE user_id = $1`, 
            [user_id]
        );
        
        if (!userExists.rows[0]) {
            throw new Error('User tidak ditemukan');
        }

        const result = await pool.query(
            `INSERT INTO organizations_profiles 
             (user_id, org_name, contact_person, contact_phone_org, org_type) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING org_id, user_id, org_name, contact_person, contact_phone_org, org_type`,
            [user_id, org_name, contact_person, contact_phone_org, org_type]
        );
        
        return result.rows[0];
    },

    // Update organization profile
    updateOrgProfile: async (orgData) => {
        const { user_id, org_name, contact_person, contact_phone_org, org_type } = orgData;

        if (!user_id) throw new Error('User ID is required');

        const result = await pool.query(
            `UPDATE organizations_profiles 
             SET org_name = $2, contact_person = $3, contact_phone_org = $4, org_type = $5
             WHERE user_id = $1 
             RETURNING org_id, user_id, org_name, contact_person, contact_phone_org, org_type`,
            [user_id, org_name, contact_person, contact_phone_org, org_type]
        );
        
        if (!result.rows[0]) {
            throw new Error('Profile tidak ditemukan');
        }
        
        return result.rows[0];
    },

    // Utility method to create or update profile (upsert)
    upsertOrgProfile: async (orgData) => {
        const existingProfile = await orgProfileModel.getOrgProfileByUserId(orgData.user_id);
        
        if (existingProfile) {
            return orgProfileModel.updateOrgProfile(orgData);
        } else {
            return orgProfileModel.createOrgProfile(orgData);
        }
    }
};

module.exports = orgProfileModel;