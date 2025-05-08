const pool = require('../config/database').pool;

const orderDetailModel = {
    createOrderDetails: async (orderId, items) => {
        const query = `
            INSERT INTO order_details 
            (order_id, product_id, quantity, unit_price)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
            
        const results = [];
        for (const item of items) {
            const { product_id, quantity, unit_price } = item;
            const result = await pool.query(query, [orderId, product_id, quantity, unit_price]);
            results.push(result.rows[0]);
        }
        return results;
    },

    getOrderDetails: async (orderId) => {
        const query = `
            SELECT od.*, p.container_type, p.description
            FROM order_details od
            JOIN products p ON od.product_id = p.product_id
            WHERE od.order_id = $1`;
        const result = await pool.query(query, [orderId]);
        return result.rows;
    },

    updateOrderDetail: async (detailId, quantity) => {
        const query = `
            UPDATE order_details 
            SET quantity = $2
            WHERE detail_id = $1
            RETURNING *`;
        const result = await pool.query(query, [detailId, quantity]);
        return result.rows[0];
    },

    deleteOrderDetail: async (detailId) => {
        const query = 'DELETE FROM order_details WHERE detail_id = $1 RETURNING *';
        const result = await pool.query(query, [detailId]);
        return result.rows[0];
    },

    getOrderTotal: async (orderId) => {
        const query = `
            SELECT SUM(quantity * unit_price) as total
            FROM order_details
            WHERE order_id = $1`;
        const result = await pool.query(query, [orderId]);
        return result.rows[0].total || 0;
    }
};

module.exports = orderDetailModel;