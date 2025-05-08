const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get user's cart
router.get('/', cartController.getCart);

// Add item to cart
router.post('/add', [
    body('productId').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], cartController.addToCart);

// Update item quantity
router.put('/update', [
    body('productId').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], cartController.updateCartQuantity);

// Remove item from cart
router.delete('/item/:productId', [
    param('productId').isInt().withMessage('Product ID must be an integer')
], cartController.removeFromCart);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

// Validate cart (check stock availability)
router.get('/validate', cartController.validateCart);

module.exports = router;