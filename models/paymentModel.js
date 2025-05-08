const pool = require('../config/database').pool;

const paymentModel = {
    createPayment: async (paymentData) => {
        const { order_id, amount, payment_method, status = 'pending' } = paymentData;
        const query = `
            INSERT INTO payment 
            (order_id, amount, payment_method, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const result = await pool.query(query, [order_id, amount, payment_method, status]);
        return result.rows[0];
    },

    getPaymentById: async (paymentId) => {
        const query = `
            SELECT p.*, o.user_id, o.order_date, o.status as order_status
            FROM payment p
            JOIN order_item o ON p.order_id = o.order_id
            WHERE p.payment_id = $1`;
        const result = await pool.query(query, [paymentId]);
        return result.rows[0];
    },

    getPaymentByOrderId: async (orderId) => {
        const query = `
            SELECT * FROM payment 
            WHERE order_id = $1`;
        const result = await pool.query(query, [orderId]);
        return result.rows[0];
    },

    updatePaymentStatus: async (paymentId, status, transactionId = null) => {
        const query = `
            UPDATE payment 
            SET status = $2, 
                transaction_id = COALESCE($3, transaction_id)
            WHERE payment_id = $1
            RETURNING *`;
        const result = await pool.query(query, [paymentId, status, transactionId]);
        return result.rows[0];
    },

    getUserPayments: async (userId) => {
        const query = `
            SELECT p.*, o.order_date, o.status as order_status
            FROM payment p
            JOIN order_item o ON p.order_id = o.order_id
            WHERE o.user_id = $1
            ORDER BY p.payment_date DESC`;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    getAllPayments: async () => {
        const query = `
            SELECT p.*, o.user_id, o.order_date, o.status as order_status, u.email as user_email
            FROM payment p
            JOIN order_item o ON p.order_id = o.order_id
            JOIN users u ON o.user_id = u.user_id
            ORDER BY p.payment_date DESC`;
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = paymentModel;