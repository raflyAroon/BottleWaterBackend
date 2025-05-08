const db = require('../config/database').pool;

const orderItemModel = {
    createOrder: async (orderData) => {
        const { user_id, scheduled_delivery_date, total_amount, status, location_id, order_type } = orderData;
        const query = `
            INSERT INTO order_item 
            (user_id, scheduled_delivery_date, total_amount, status, location_id, order_type)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`;
        const values = [user_id, scheduled_delivery_date, total_amount, status || 'pending', location_id, order_type];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    getOrderById: async (orderId) => {
        const query = `
            SELECT o.*, u.email as user_email,
                   CASE 
                       WHEN o.order_type = 'organization' THEN ol.location_name 
                       ELSE NULL 
                   END as location_name
            FROM order_item o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN org_locations ol ON o.location_id = ol.location_id
            WHERE o.order_id = $1`;
        const result = await db.query(query, [orderId]);
        return result.rows[0];
    },

    getUserOrders: async (userId) => {
        const query = `
            SELECT o.*, 
                   CASE 
                       WHEN o.order_type = 'organization' THEN ol.location_name 
                       ELSE NULL 
                   END as location_name
            FROM order_item o
            LEFT JOIN org_locations ol ON o.location_id = ol.location_id
            WHERE o.user_id = $1
            ORDER BY o.order_date DESC`;
        const result = await db.query(query, [userId]);
        return result.rows;
    },

    getAllOrders: async () => {
        const query = `
            SELECT o.*, u.email as user_email,
                   CASE 
                       WHEN o.order_type = 'organization' THEN ol.location_name 
                       ELSE NULL 
                   END as location_name
            FROM order_item o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN org_locations ol ON o.location_id = ol.location_id
            ORDER BY o.order_date DESC`;
        const result = await db.query(query);
        return result.rows;
    },

    updateOrderStatus: async (orderId, status) => {
        const query = `
            UPDATE order_item 
            SET status = $2
            WHERE order_id = $1
            RETURNING *`;
        const result = await db.query(query, [orderId, status]);
        return result.rows[0];
    },

    getLocationOrders: async (locationId) => {
        const query = `
            SELECT o.*, u.email as user_email
            FROM order_item o
            JOIN users u ON o.user_id = u.user_id
            WHERE o.location_id = $1
            ORDER BY o.order_date DESC`;
        const result = await db.query(query, [locationId]);
        return result.rows;
    }
};

module.exports = orderItemModel;