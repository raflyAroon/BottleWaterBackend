const orderItemModel = require('../models/orderItemModel');
const orderDetailModel = require('../models/orderDetailModel');
const cartModel = require('../models/cartModel');
const paymentModel = require('../models/paymentModel');

const orderController = {
    createOrder: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const { scheduled_delivery_date, location_id, order_type, payment_method } = req.body;

            // Get cart items
            const cartItems = await cartModel.getUserCart(user_id);
            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cart is empty'
                });
            }

            const total = await cartModel.getCartTotal(user_id);

            // Create order
            const orderData = {
                user_id,
                scheduled_delivery_date,
                total_amount: total,
                location_id,
                order_type: order_type || 'customer',
                status: 'pending'
            };

            const order = await orderItemModel.createOrder(orderData);

            // Create order details
            const orderItems = cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            await orderDetailModel.createOrderDetails(order.order_id, orderItems);

            // Create payment record
            const paymentData = {
                order_id: order.order_id,
                amount: total,
                payment_method,
                status: 'pending'
            };

            const payment = await paymentModel.createPayment(paymentData);

            // Clear cart after successful order creation
            await cartModel.clearCart(user_id);

            res.status(201).json({
                status: 'success',
                message: 'Order created successfully',
                data: {
                    order,
                    payment
                }
            });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create order',
                error: error.message
            });
        }
    },

    getOrder: async (req, res) => {
        try {
            const { orderId } = req.params;
            const order = await orderItemModel.getOrderById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order not found'
                });
            }

            // Check authorization
            if (req.user.role !== 'admin' && order.user_id !== req.user.user_id) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access to order'
                });
            }

            const orderDetails = await orderDetailModel.getOrderDetails(orderId);
            const payment = await paymentModel.getPaymentByOrderId(orderId);

            res.status(200).json({
                status: 'success',
                data: {
                    order,
                    items: orderDetails,
                    payment
                }
            });
        } catch (error) {
            console.error('Error getting order:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve order',
                error: error.message
            });
        }
    },

    getUserOrders: async (req, res) => {
        try {
            const user_id = req.user.user_id;
            const orders = await orderItemModel.getUserOrders(user_id);

            res.status(200).json({
                status: 'success',
                data: orders
            });
        } catch (error) {
            console.error('Error getting user orders:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve orders',
                error: error.message
            });
        }
    },

    getAllOrders: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const orders = await orderItemModel.getAllOrders();

            res.status(200).json({
                status: 'success',
                data: orders
            });
        } catch (error) {
            console.error('Error getting all orders:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve orders',
                error: error.message
            });
        }
    },

    updateOrderStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const order = await orderItemModel.updateOrderStatus(orderId, status);
            
            if (!order) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Order status updated',
                data: order
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update order status',
                error: error.message
            });
        }
    }
};

module.exports = orderController;