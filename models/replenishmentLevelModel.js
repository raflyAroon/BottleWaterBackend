const pool = require('../config/database').pool;

const replenishmentLevelModel = {
    // Get replenishment levels for a location
    getLevelsByLocation: async (locationId) => {
        try {
            const result = await pool.query(
                `SELECT rl.*, p.container_type, p.description 
                FROM replenishment_levels rl
            JOIN products p ON rl.product_id = p.product_id
                WHERE rl.location_id = $1`,
                [locationId]
            );
        return result.rows;
        } catch (error) {
            console.error('Error getting replenishment levels:', error);
            throw new Error('Failed to get replenishment levels');
        }
    },

    // Get specific replenishment level
    getLevel: async (locationId, productId) => {
        try {
            const result = await pool.query(
                `SELECT rl.*, p.container_type, p.description 
            FROM replenishment_levels rl
            JOIN products p ON rl.product_id = p.product_id
                WHERE rl.location_id = $1 AND rl.product_id = $2`,
                [locationId, productId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting replenishment level:', error);
            throw new Error('Failed to get replenishment level');
    }
    },

    // Create or update replenishment level
    setLevel: async (locationId, productId, targetLevel, currentLevel = 0) => {
        try {
            // Check if level exists
            const existingLevel = await pool.query(
                'SELECT * FROM replenishment_levels WHERE location_id = $1 AND product_id = $2',
                [locationId, productId]
            );
            
            if (existingLevel.rows.length > 0) {
                // Update existing level
                const result = await pool.query(
                    `UPDATE replenishment_levels 
                    SET target_level = $3, current_level = $4, last_updated = CURRENT_TIMESTAMP 
                    WHERE location_id = $1 AND product_id = $2 
                    RETURNING *`,
                    [locationId, productId, targetLevel, currentLevel]
                );
                return result.rows[0];
            } else {
                // Create new level
                const result = await pool.query(
                    `INSERT INTO replenishment_levels 
                    (location_id, product_id, target_level, current_level) 
                    VALUES ($1, $2, $3, $4) 
                    RETURNING *`,
                    [locationId, productId, targetLevel, currentLevel]
                );
                return result.rows[0];
            }
        } catch (error) {
            console.error('Error setting replenishment level:', error);
            throw new Error('Failed to set replenishment level');
        }
    },

    // Update current level
    updateCurrentLevel: async (locationId, productId, currentLevel) => {
        try {
            const result = await pool.query(
                `UPDATE replenishment_levels 
                SET current_level = $3, last_updated = CURRENT_TIMESTAMP 
                WHERE location_id = $1 AND product_id = $2 
                RETURNING *`,
                [locationId, productId, currentLevel]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Replenishment level not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating current level:', error);
            throw new Error('Failed to update current level');
        }
    },

    // Get low stock items (where current_level < target_level)
    getLowStockItems: async (locationId = null) => {
        try {
            let query = `
                SELECT rl.*, p.container_type, p.description, ol.location_name, ol.org_id
                FROM replenishment_levels rl
                JOIN products p ON rl.product_id = p.product_id
                JOIN org_locations ol ON rl.location_id = ol.location_id
                WHERE rl.current_level < rl.target_level
            `;
            
            const params = [];
            if (locationId) {
                query += ' AND rl.location_id = $1';
                params.push(locationId);
            }
            
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting low stock items:', error);
            throw new Error('Failed to get low stock items');
        }
    },

    // Delete a replenishment level
    deleteLevel: async (locationId, productId) => {
        try {
            const result = await pool.query(
                'DELETE FROM replenishment_levels WHERE location_id = $1 AND product_id = $2 RETURNING *',
                [locationId, productId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Replenishment level not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting replenishment level:', error);
            throw new Error('Failed to delete replenishment level');
        }
    }
};

module.exports = replenishmentLevelModel;