const express = require('express');
const router = express.Router();
const replenishmentController = require('../controller/replenishmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// All routes require authentication and admin privileges
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

// Create new replenishment order
router.post('/', [
    body('locationId').isInt().notEmpty(),
    body('scheduledDate').isISO8601(),
    body('products').isArray(),
    body('products.*.product_id').isInt(),
    body('products.*.quantity').isInt().withMessage('Quantity must be an integer').custom(value => value > 0).withMessage('Quantity must be positive')
], replenishmentController.createReplenishmentOrder);

// Get replenishment status for a location
router.get('/status/:locationId', [
    param('locationId').isInt()
], replenishmentController.getReplenishmentStatus);

// Update stock levels
router.put('/stock/:locationId/:productId', [
    param('locationId').isInt(),
    param('productId').isInt(),
    body('currentLevel').isInt({ min: 0 }),
    body('targetLevel').isInt({ min: 0 })
], replenishmentController.updateStockLevels);

// Get low stock items
router.get('/low-stock', replenishmentController.getLowStockItems);

// Get stock out history
router.get('/stock-out/:locationId', [
    param('locationId').isInt(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601()
], replenishmentController.getStockOutHistory);

// Get stock out counter
router.get('/stock-out-counter/:locationId', [
    param('locationId').isInt()
], replenishmentController.getStockOutCounter);

// Complete replenishment order
router.put('/:replenishmentId/complete', [
    param('replenishmentId').isInt()
], replenishmentController.completeReplenishmentOrder);

module.exports = router;