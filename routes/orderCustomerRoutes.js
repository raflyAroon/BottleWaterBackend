const express = require('express');
const router = express.Router();
const orderCustomerControl = require('../controller/orderCustomerControl');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is authenticated for all routes
router.use(authMiddleware.authenticate);

// Create a new order (requires authentication)
router.post('/', orderCustomerControl.createOrder);

// Get all orders (admin only)
router.get('/', authMiddleware.isAdmin, orderCustomerControl.getAllOrders);

// Get orders by customer ID
router.get('/customer/:customerId', orderCustomerControl.getOrdersByCustomerId);

// Get specific order by ID
router.get('/:orderId', orderCustomerControl.getOrderById);

// Update order status (admin only)
router.put('/:orderId/status', authMiddleware.isAdmin, orderCustomerControl.updateOrderStatus);

// Update payment status (admin only)
router.put('/:orderId/payment', authMiddleware.isAdmin, orderCustomerControl.updatePaymentStatus);

module.exports = router;