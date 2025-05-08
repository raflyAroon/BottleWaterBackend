const pool = require('../config/database').pool;

const orderCustomerModel = {
    createOrder: async (orderData) => {
        const { customer_id, product_id, quantity, total_amount, payment_method, notes } = orderData;
        
        if (!customer_id) throw new Error('Customer ID diperlukan');
        if (!product_id) throw new Error('Product ID diperlukan');
        if (!quantity) throw new Error('Quantity diperlukan');
        if (!total_amount) throw new Error('Total amount diperlukan');
        if (!payment_method) throw new Error('Payment method diperlukan');

        try {
            const query = `
                INSERT INTO customer_orders 
                (customer_id, product_id, quantity, order_date, status, total_amount, payment_method, payment_status, notes)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'pending', $4, $5, 'waiting', $6)
                RETURNING *`;
            const values = [customer_id, product_id, quantity, total_amount, payment_method, notes || ''];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error in createOrder:', error);
            throw new Error('Gagal membuat order: ' + error.message);
        }
    },

    getAllOrders: async () => {
        try {
            const query = `
                SELECT co.*, 
                       cp.full_name as customer_name,
                       p.container_type as product_name,
                       p.unit_price
                FROM customer_orders co
                JOIN customer_profiles cp ON co.customer_id = cp.customer_id
                JOIN products p ON co.product_id = p.product_id
                ORDER BY co.order_date DESC`;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            throw new Error('Gagal mengambil data order: ' + error.message);
        }
    },

    getOrdersByCustomerId: async (customerId) => {
        try {
            const query = `
                SELECT co.*, 
                       cp.full_name as customer_name,
                       p.container_type as product_name,
                       p.unit_price
                FROM customer_orders co
                JOIN customer_profiles cp ON co.customer_id = cp.customer_id
                JOIN products p ON co.product_id = p.product_id
                WHERE co.customer_id = $1
                ORDER BY co.order_date DESC`;
            const result = await pool.query(query, [customerId]);
            return result.rows;
        } catch (error) {
            console.error('Error in getOrdersByCustomerId:', error);
            throw new Error('Gagal mengambil data order customer: ' + error.message);
        }
    },

    getOrderById: async (orderId) => {
        try {
            const query = `
                SELECT co.*, 
                       cp.full_name as customer_name,
                       p.container_type as product_name,
                       p.unit_price
                FROM customer_orders co
                JOIN customer_profiles cp ON co.customer_id = cp.customer_id
                JOIN products p ON co.product_id = p.product_id
                WHERE co.order_id = $1`;
            const result = await pool.query(query, [orderId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in getOrderById:', error);
            throw new Error('Gagal mengambil data order: ' + error.message);
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            // Validate status
            const validStatuses = ['pending', 'confirmed', 'delivery', 'done'];
            if (!validStatuses.includes(status)) {
                throw new Error('Status tidak valid');
            }

            const query = `
                UPDATE customer_orders 
                SET status = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = $1
                RETURNING *`;
            const result = await pool.query(query, [orderId, status]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            throw new Error('Gagal memperbarui status order: ' + error.message);
        }
    },

    updatePaymentStatus: async (orderId, paymentStatus) => {
        try {
            // Validate payment status
            const validPaymentStatuses = ['waiting', 'approved'];
            if (!validPaymentStatuses.includes(paymentStatus)) {
                throw new Error('Payment status tidak valid');
            }

            const query = `
                UPDATE customer_orders 
                SET payment_status = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE order_id = $1
                RETURNING *`;
            const result = await pool.query(query, [orderId, paymentStatus]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in updatePaymentStatus:', error);
            throw new Error('Gagal memperbarui status pembayaran: ' + error.message);
        }
    }
};

module.exports = orderCustomerModel;