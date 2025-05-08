const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Process payment
router.post('/process', paymentController.processPayment);

// Get payment by ID
router.get('/:paymentId', paymentController.getPaymentDetails);

// Get user's payment history
router.get('/history', paymentController.getPaymentHistory);

// Admin routes
router.get('/all', authMiddleware.isAdmin, paymentController.getAllPayments);
router.put('/:paymentId/status', authMiddleware.isAdmin, paymentController.updatePaymentStatus);

module.exports = router;