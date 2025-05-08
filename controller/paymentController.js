const paymentModel = require('../models/paymentModel');
const orderItemModel = require('../models/orderItemModel');

const paymentController = {
    processPayment: async (req, res) => {
        try {
            const { order_id, payment_method, transaction_id } = req.body;
            
            // Verify order exists and belongs to user
            const order = await orderItemModel.getOrderById(order_id);
            if (!order) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order not found'
                });
            }

            if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access to order'
                });
            }

            // Check if payment already exists
            const existingPayment = await paymentModel.getPaymentByOrderId(order_id);
            if (existingPayment) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Payment already exists for this order'
                });
            }

            const paymentData = {
                order_id,
                amount: order.total_amount,
                payment_method,
                status: 'pending'
            };

            const payment = await paymentModel.createPayment(paymentData);

            // In a real application, you would integrate with a payment gateway here
            // For now, we'll simulate a successful payment
            const updatedPayment = await paymentModel.updatePaymentStatus(
                payment.payment_id,
                'completed',
                transaction_id
            );

            // Update order status if payment is successful
            if (updatedPayment.status === 'completed') {
                await orderItemModel.updateOrderStatus(order_id, 'processing');
            }

            res.status(200).json({
                status: 'success',
                message: 'Payment processed successfully',
                data: updatedPayment
            });
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to process payment',
                error: error.message
            });
        }
    },

    getPaymentHistory: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const payments = await paymentModel.getUserPayments(user_id);

            res.status(200).json({
                status: 'success',
                data: payments
            });
        } catch (error) {
            console.error('Error getting payment history:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve payment history',
                error: error.message
            });
        }
    },

    getPaymentDetails: async (req, res) => {
        try {
            const { paymentId } = req.params;
            const payment = await paymentModel.getPaymentById(paymentId);

            if (!payment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Payment not found'
                });
            }

            // Check authorization
            if (req.user.role !== 'admin' && payment.user_id !== req.user.user_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access to payment details'
                });
            }

            res.status(200).json({
                status: 'success',
                data: payment
            });
        } catch (error) {
            console.error('Error getting payment details:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve payment details',
                error: error.message
            });
        }
    },

    getAllPayments: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const payments = await paymentModel.getAllPayments();

            res.status(200).json({
                status: 'success',
                data: payments
            });
        } catch (error) {
            console.error('Error getting all payments:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve payments',
                error: error.message
            });
        }
    },

    updatePaymentStatus: async (req, res) => {
        try {
            const { paymentId } = req.params;
            const { status, transaction_id } = req.body;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const payment = await paymentModel.updatePaymentStatus(paymentId, status, transaction_id);
            
            if (!payment) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Payment not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Payment status updated',
                data: payment
            });
        } catch (error) {
            console.error('Error updating payment status:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update payment status',
                error: error.message
            });
        }
    }
};

module.exports = paymentController;