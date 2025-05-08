const express = require('express');
const router = express.Router();
const deliveryController = require('../controller/deliveryController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Create new delivery (admin only)
router.post('/', authMiddleware.isAdmin, deliveryController.createDelivery);

// Get delivery by ID
router.get('/:deliveryId', deliveryController.getDeliveryById);

// Get delivery by order ID
router.get('/order/:orderId', deliveryController.getDeliveryByOrderId);

// Update delivery status (admin only)
router.put('/:deliveryId/status', authMiddleware.isAdmin, deliveryController.updateDeliveryStatus);

// Get driver's deliveries (admin only)
router.get('/driver', authMiddleware.isAdmin, deliveryController.getDriverDeliveries);

// Get all deliveries (admin only)
router.get('/', authMiddleware.isAdmin, deliveryController.getAllDeliveries);

module.exports = router;