// models/productModel.js
const pool = require('../config/database').pool;

const productModel = {
    // Get all products
    getAllProducts: async () => {
        try {
        const result = await pool.query(
                'SELECT * FROM products WHERE is_active = true ORDER BY container_type'
        );
            return result.rows;
        } catch (error) {
            console.error('Error getting all products:', error);
            throw new Error('Failed to get products');
    }
    },

    // Get product by ID
    getProductById: async (productId) => {
        try {
            const result = await pool.query(
                'SELECT * FROM products WHERE product_id = $1',
                [productId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting product by ID:', error);
            throw new Error('Failed to get product');
        }
    },

    // Create a new product
    createProduct: async (productData) => {
        const { container_type, description, unit_price, current_stock } = productData;
        
        try {
            const result = await pool.query(
                `INSERT INTO products 
                (container_type, description, unit_price, current_stock) 
                VALUES ($1, $2, $3, $4) 
                RETURNING *`,
                [container_type, description, unit_price, current_stock || 0]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating product:', error);
            throw new Error('Failed to create product');
        }
    },

    // Update an existing product
    updateProduct: async (productId, productData) => {
        const { container_type, description, unit_price, current_stock, is_active } = productData;
        
        try {
            const result = await pool.query(
                `UPDATE products 
                SET container_type = $1, description = $2, unit_price = $3, 
                    current_stock = $4, is_active = $5 
                WHERE product_id = $6 
                RETURNING *`,
                [container_type, description, unit_price, current_stock, is_active, productId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Product not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating product:', error);
            throw new Error('Failed to update product');
        }
    },

    // Update product stock
    updateStock: async (productId, quantity) => {
        try {
            const result = await pool.query(
                `UPDATE products 
                SET current_stock = current_stock + $1 
                WHERE product_id = $2 
                RETURNING *`,
                [quantity, productId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Product not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating product stock:', error);
            throw new Error('Failed to update product stock');
        }
    },

    // Delete a product (soft delete by setting is_active to false)
    deleteProduct: async (productId) => {
        try {
            const result = await pool.query(
                `UPDATE products 
                SET is_active = false 
                WHERE product_id = $1 
                RETURNING *`,
                [productId]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Product not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error('Failed to delete product');
        }
    }
};

module.exports = productModel;