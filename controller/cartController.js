const CartModel = require('../models/cartModel');

const cartController = {
    getCart: async (req, res) => {
        try {
            // Make sure user is authenticated and has an ID
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    status: 'error',
                    success: false, 
                    message: 'User not authenticated' 
                });
            }

            const userId = req.user.id;
            const cartItems = await CartModel.getCart(userId);
            
            return res.json({ 
                status: 'success',
                success: true, 
                data: cartItems 
            });
        } catch (error) {
            console.error('Error getting cart:', error);
            return res.status(500).json({ 
                status: 'error',
                success: false, 
                message: 'Failed to retrieve cart items',
                error: error.message 
                });
            }
    },

    addToCart: async (req, res) => {
        try {
            // Make sure user is authenticated and has an ID
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    status: 'error',
                    success: false, 
                    message: 'User not authenticated' 
                });
            }

            const userId = req.user.id;
            const { productId, quantity } = req.body;

            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({ 
                    status: 'error',
                    success: false, 
                    message: 'Invalid product ID or quantity' 
                });
        }

            const cartItem = await CartModel.addToCart(userId, productId, quantity);
            
            return res.json({ 
                status: 'success',
                success: true, 
                data: cartItem,
                message: 'Item added to cart successfully'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            
            // Handle specific errors
            if (error.message.includes('Product not found')) {
                return res.status(404).json({ 
                    status: 'error',
                    success: false, 
                    message: 'Product not found' 
                });
    }
            
            return res.status(500).json({ 
                status: 'error',
                success: false, 
                message: 'Failed to add item to cart',
                error: error.message 
            });
        }
    },

    updateCartQuantity: async (req, res) => {
        try {
            // Make sure user is authenticated and has an ID
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    status: 'error',
                    success: false, 
                    message: 'User not authenticated' 
                });
            }
            
            const userId = req.user.id;
            const { productId, quantity } = req.body;

            if (!productId || !quantity || quantity < 0) {
                return res.status(400).json({ 
                    status: 'error',
                    success: false, 
                    message: 'Invalid product ID or quantity' 
                });
            }

            const updatedItem = await CartModel.updateQuantity(userId, productId, quantity);
            
            return res.json({ 
                status: 'success',
                success: true, 
                data: updatedItem,
                message: 'Cart item updated successfully'
            });
        } catch (error) {
            console.error('Error updating cart:', error);
            
            // Handle specific errors
            if (error.message.includes('Cart item not found')) {
                return res.status(404).json({ 
                    status: 'error',
                    success: false, 
                    message: 'Cart item not found' 
                });
            }
            
            return res.status(500).json({ 
                status: 'error',
                success: false, 
                message: 'Failed to update cart item',
                error: error.message 
            });
        }
    },

    removeFromCart: async (req, res) => {
        try {
            // Make sure user is authenticated and has an ID
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    status: 'error',
                    success: false, 
                    message: 'User not authenticated' 
                });
            }
            
            const userId = req.user.id;
            const productId = req.params.productId;

            const removedItem = await CartModel.removeFromCart(userId, productId);
            
            return res.json({ 
                status: 'success',
                success: true, 
                data: removedItem,
                message: 'Item removed from cart successfully'
            });
        } catch (error) {
            console.error('Error removing from cart:', error);
            
            // Handle specific errors
            if (error.message.includes('Cart item not found')) {
                return res.status(404).json({ 
                    status: 'error',
                    success: false, 
                    message: 'Cart item not found' 
                });
            }
            
            return res.status(500).json({ 
                status: 'error',
                success: false, 
                message: 'Failed to remove item from cart',
                error: error.message 
            });
        }
    },

    clearCart: async (req, res) => {
        try {
            // Make sure user is authenticated and has an ID
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    status: 'error',
                    success: false, 
                    message: 'User not authenticated' 
                });
            }
            
            const userId = req.user.id;
            await CartModel.clearCart(userId);
            
            return res.json({ 
                status: 'success',
                success: true, 
                message: 'Cart cleared successfully' 
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
            return res.status(500).json({ 
                status: 'error',
                success: false, 
                message: 'Failed to clear cart',
                error: error.message 
            });
        }
    },

    validateCart: async (req, res) => {
        try {
            // Make sure user is authenticated and has an ID
            if (!req.user || !req.user.id) {
                return res.status(401).json({ 
                    status: 'error',
                    success: false, 
                    message: 'User not authenticated' 
                });
            }
            
            const userId = req.user.id;
            const invalidItems = await CartModel.validateCart(userId);
            
            if (invalidItems.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    success: false,
                    message: 'Some items exceed available stock',
                    invalidItems
                });
            }

            return res.json({ 
                status: 'success',
                success: true, 
                message: 'Cart is valid' 
            });
        } catch (error) {
            console.error('Error validating cart:', error);
            return res.status(500).json({ 
                status: 'error',
                success: false, 
                message: 'Failed to validate cart',
                error: error.message 
            });
        }
    }
};

module.exports = cartController;