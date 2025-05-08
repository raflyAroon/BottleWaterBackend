const pool = require('../config/database').pool;

const stockOutHistoryModel = {
    // Record a stock out event
    recordStockOut: async (locationId, productId) => {
        try {
            const result = await pool.query(
                `INSERT INTO stock_out_history 
                (location_id, product_id) 
                VALUES ($1, $2) 
                RETURNING *`,
                [locationId, productId]
            );
        return result.rows[0];
        } catch (error) {
            console.error('Error recording stock out:', error);
            throw new Error('Failed to record stock out');
        }
    },

    // Get stock out history for a location
    getStockOutHistory: async (locationId, startDate = null, endDate = null) => {
        try {
            let query = `
                SELECT soh.*, p.container_type, p.description 
                FROM stock_out_history soh
                JOIN products p ON soh.product_id = p.product_id
                WHERE soh.location_id = $1
            `;
            
            const params = [locationId];
            
            if (startDate) {
                query += ' AND soh.stock_out_date >= $2';
                params.push(startDate);
            }
            
            if (endDate) {
                query += ` AND soh.stock_out_date <= $${params.length + 1}`;
                params.push(endDate);
            }
            
            query += ' ORDER BY soh.stock_out_date DESC';
            const result = await pool.query(query, params);
        return result.rows;
        } catch (error) {
            console.error('Error getting stock out history:', error);
            throw new Error('Failed to get stock out history');
        }
    },

    // Get stock out history for a specific product at a location
    getProductStockOutHistory: async (locationId, productId, startDate = null, endDate = null) => {
        try {
            let query = `
                SELECT * FROM stock_out_history 
                WHERE location_id = $1 AND product_id = $2
            `;
            
            const params = [locationId, productId];
            
            if (startDate) {
                query += ` AND stock_out_date >= $3`;
                params.push(startDate);
            }
            
            if (endDate) {
                query += ` AND stock_out_date <= $${params.length + 1}`;
                params.push(endDate);
            }
            query += ' ORDER BY stock_out_date DESC';
            const result = await pool.query(query, params);
        return result.rows;
        } catch (error) {
            console.error('Error getting product stock out history:', error);
            throw new Error('Failed to get product stock out history');
        }
    }
};

module.exports = stockOutHistoryModel;