const orderCustomerModel = require('../models/orderCustomerModel');

const orderCustomerControl = {
    createOrder: async (req, res) => {
        try {
            if (!req.user || !req.user.user_id) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User tidak terautentikasi',
                    data: null
                });
            }

            const orderData = {
                ...req.body,
                customer_id: req.user.user_id // Menggunakan user_id dari payload token
            };

            const result = await orderCustomerModel.createOrder(orderData);
            res.status(201).json({
                status: 'success',
                message: 'Order berhasil dibuat',
                data: result
            });
        } catch (error) {
            console.error('Error in createOrder:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat membuat order',
                error: error.message
            });
        }
    },

    getAllOrders: async (req, res) => {
        try {
            const orders = await orderCustomerModel.getAllOrders();
            res.status(200).json({
                status: 'success',
                data: orders
            });
        } catch (error) {
            console.error('Error in getAllOrders:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil data order',
                error: error.message
            });
        }
    },

    getOrdersByCustomerId: async (req, res) => {
        try {
            const customerId = parseInt(req.params.customerId) || req.user.user_id;
            
            // Validate customer ID
            if (!customerId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'ID customer diperlukan',
                    data: null
                });
            }

            // Check if user is authorized to view these orders
            if (req.user.role !== 'admin' && req.user.user_id !== customerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Tidak memiliki izin untuk melihat order ini',
                    data: null
                });
            }

            const orders = await orderCustomerModel.getOrdersByCustomerId(customerId);
            res.status(200).json({
                status: 'success',
                data: orders
            });
        } catch (error) {
            console.error('Error in getOrdersByCustomerId:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil data order customer',
                error: error.message
            });
        }
    },

    getOrderById: async (req, res) => {
        try {
            const orderId = req.params.orderId;
            const order = await orderCustomerModel.getOrderById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order tidak ditemukan',
                    data: null
                });
            }

            // Check if user is authorized to view this order
            if (req.user.role !== 'admin' && req.user.user_id !== order.customer_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Tidak memiliki izin untuk melihat order ini',
                    data: null
                });
            }

            res.status(200).json({
                status: 'success',
                data: order
            });
        } catch (error) {
            console.error('Error in getOrderById:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil data order',
                error: error.message
            });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const updatedOrder = await orderCustomerModel.updateOrderStatus(orderId, status);
            if (!updatedOrder) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order tidak ditemukan',
                    data: null
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Status order berhasil diperbarui',
                data: updatedOrder
            });
        } catch (error) {
            console.error('Error in updateOrderStatus:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat memperbarui status order',
                error: error.message
            });
        }
    },

    updatePaymentStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { paymentStatus } = req.body;

            const updatedOrder = await orderCustomerModel.updatePaymentStatus(orderId, paymentStatus);
            if (!updatedOrder) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order tidak ditemukan',
                    data: null
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Status pembayaran berhasil diperbarui',
                data: updatedOrder
            });
        } catch (error) {
            console.error('Error in updatePaymentStatus:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat memperbarui status pembayaran',
                error: error.message
            });
        }
    }
};

module.exports = orderCustomerControl;