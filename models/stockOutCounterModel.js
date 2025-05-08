const pool = require('../config/database').pool;

const stockOutCounterModel = {
    // Get counter for a specific product at a location
    getCounter: async (locationId, productId) => {
        try {
            const result = await pool.query(
                `SELECT * FROM stock_out_counter 
                WHERE location_id = $1 AND product_id = $2`,
                [locationId, productId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting stock out counter:', error);
            throw new Error('Failed to get stock out counter');
        }
    },

    // Increment counter for a product at a location
    incrementCounter: async (locationId, productId) => {
        try {
            // Check if counter exists
            const existingCounter = await pool.query(
                'SELECT * FROM stock_out_counter WHERE location_id = $1 AND product_id = $2',
                [locationId, productId]
            );
            
            if (existingCounter.rows.length > 0) {
                // Increment existing counter
                const result = await pool.query(
                    `UPDATE stock_out_counter 
                    SET consecutive_weeks = consecutive_weeks + 1, last_updated = CURRENT_TIMESTAMP 
                    WHERE location_id = $1 AND product_id = $2 
                    RETURNING *`,
                    [locationId, productId]
                );
        return result.rows[0];
            } else {
                // Create new counter
                const result = await pool.query(
                    `INSERT INTO stock_out_counter 
                    (location_id, product_id, consecutive_weeks) 
                    VALUES ($1, $2, 1) 
                    RETURNING *`,
                    [locationId, productId]
                );
        return result.rows[0];
            }
        } catch (error) {
            console.error('Error incrementing stock out counter:', error);
            throw new Error('Failed to increment stock out counter');
        }
    },

    // Reset counter for a product at a location
    resetCounter: async (locationId, productId) => {
        try {
            const result = await pool.query(
                `UPDATE stock_out_counter 
                SET consecutive_weeks = 0, last_updated = CURRENT_TIMESTAMP 
                WHERE location_id = $1 AND product_id = $2 
                RETURNING *`,
                [locationId, productId]
            );
            
            if (result.rows.length === 0) {
                // If no counter exists, create one with 0
                const newResult = await pool.query(
                    `INSERT INTO stock_out_counter 
                    (location_id, product_id, consecutive_weeks) 
                    VALUES ($1, $2, 0) 
                    RETURNING *`,
                    [locationId, productId]
                );
                return newResult.rows[0];
            }
            return result.rows[0];
        } catch (error) {
            console.error('Error resetting stock out counter:', error);
            throw new Error('Failed to reset stock out counter');
        }
    },

    // Get all counters that have reached the threshold
    getThresholdCounters: async (threshold = 3) => {
        try {
            const result = await pool.query(
                `SELECT soc.*, p.container_type, p.description, ol.location_name, ol.org_id
                FROM stock_out_counter soc
                JOIN products p ON soc.product_id = p.product_id
                JOIN org_locations ol ON soc.location_id = ol.location_id
                WHERE soc.consecutive_weeks >= $1`,
                [threshold]
            );
        return result.rows;
        } catch (error) {
            console.error('Error getting threshold counters:', error);
            throw new Error('Failed to get threshold counters');
        }
    }
};

module.exports = stockOutCounterModel;