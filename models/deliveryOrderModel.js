const pool = require('../config/database').pool;

const deliveryOrderModel = {
    createDelivery: async (deliveryData) => {
        const { order_id, driver_name, vehicle_id, departure_time, notes } = deliveryData;
            const query = `
            INSERT INTO delivery_order 
            (order_id, driver_name, vehicle_id, departure_time, notes)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [order_id, driver_name, vehicle_id, departure_time, notes];
        const result = await pool.query(query, values);
            return result.rows[0];
    },

    getDeliveryById: async (deliveryId) => {
        const query = `
            SELECT do.*, o.user_id, o.total_amount, o.status as order_status,
                   u.email as user_email
            FROM delivery_order do
            JOIN order_item o ON do.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            WHERE do.delivery_id = $1`;
        const result = await pool.query(query, [deliveryId]);
        return result.rows[0];
    },

    getDeliveryByOrderId: async (orderId) => {
        const query = `
            SELECT do.*, o.user_id, o.total_amount, o.status as order_status,
                   u.email as user_email
            FROM delivery_order do
            JOIN order_item o ON do.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            WHERE do.order_id = $1`;
        const result = await pool.query(query, [orderId]);
        return result.rows[0];
    },

    updateDeliveryStatus: async (deliveryId, status, actualDeliveryTime = null) => {
        const query = `
            UPDATE delivery_order 
            SET delivery_status = $1,
                actual_delivery_time = $2
            WHERE delivery_id = $3
            RETURNING *`;
        const result = await pool.query(query, [status, actualDeliveryTime, deliveryId]);
        return result.rows[0];
    },

    getDriverDeliveries: async (driverName, status = null) => {
        let query = `
            SELECT do.*, o.user_id, o.total_amount, o.status as order_status,
                   u.email as user_email
            FROM delivery_order do
            JOIN order_item o ON do.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            WHERE do.driver_name = $1`;
            
        const params = [driverName];
        
        if (status) {
            query += ` AND do.delivery_status = $2`;
            params.push(status);
        }
        
        query += ` ORDER BY do.departure_time ASC`;
        
        const result = await pool.query(query, params);
        return result.rows;
    },

    getAllDeliveries: async (status = null) => {
        let query = `
            SELECT do.*, o.user_id, o.total_amount, o.status as order_status,
                   u.email as user_email
            FROM delivery_order do
            JOIN order_item o ON do.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id`;
            
        const params = [];
        
        if (status) {
            query += ` WHERE do.delivery_status = $1`;
            params.push(status);
        }
        
        query += ` ORDER BY do.departure_time ASC`;
        
        const result = await pool.query(query, params);
        return result.rows;
    }
};

module.exports = deliveryOrderModel;