const pool = require('../config/database').pool;

const orgLocationModel = {
    // Get all locations for an organization
    getOrgLocations: async (orgId) => {
        try {
            const result = await pool.query(
                'SELECT * FROM org_locations WHERE org_id = $1 ORDER BY location_name',
                [orgId]
            );
        return result.rows;
        } catch (error) {
            console.error('Error getting organization locations:', error);
            throw new Error('Failed to get organization locations');
        }
    },

    // Get a specific location by ID
    getLocationById: async (locationId) => {
        try {
            const result = await pool.query(
                'SELECT * FROM org_locations WHERE location_id = $1',
                [locationId]
            );
        return result.rows[0];
        } catch (error) {
            console.error('Error getting location by ID:', error);
            throw new Error('Failed to get location');
        }
    },

    // Create a new location for an organization
    createLocation: async (locationData) => {
        const { org_id, location_name, address, contact_person, contact_phone, delivery_instructions, delivery_day } = locationData;
        try {
            const result = await pool.query(
                `INSERT INTO org_locations 
                (org_id, location_name, address, contact_person, contact_phone, delivery_instructions, delivery_day) 
                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                RETURNING *`,
                [org_id, location_name, address, contact_person, contact_phone, delivery_instructions, delivery_day]
            );
        return result.rows[0];
        } catch (error) {
            console.error('Error creating location:', error);
            throw new Error('Failed to create location');
        }
    },

    // Update an existing location
    updateLocation: async (locationId, locationData) => {
        const { location_name, address, contact_person, contact_phone, delivery_instructions, delivery_day } = locationData;
        
        try {
            const result = await pool.query(
                `UPDATE org_locations 
                SET location_name = $1, address = $2, contact_person = $3, contact_phone = $4, 
                    delivery_instructions = $5, delivery_day = $6, updated_at = CURRENT_TIMESTAMP 
                WHERE location_id = $7 
                RETURNING *`,
                [location_name, address, contact_person, contact_phone, delivery_instructions, delivery_day, locationId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Location not found');
    }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating location:', error);
            throw new Error('Failed to update location');
        }
    },

    // Delete a location
    deleteLocation: async (locationId) => {
        try {
            const result = await pool.query(
                'DELETE FROM org_locations WHERE location_id = $1 RETURNING *',
                [locationId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Location not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting location:', error);
            throw new Error('Failed to delete location');
        }
    }
};

module.exports = orgLocationModel;