// models/productModel.js
const pool = require('../config/database').pool;

const productModel = {
    getAllProducts: async () => {
        const result = await pool.query('SELECT product_id, container_type, description, unit_price, current_stock, is_active FROM products');
        return result.rows;
    },
    
    getProductById: async (productId) => {
        const result = await pool.query('SELECT container_type, description, unit_price FROM products WHERE product_id = $1', [productId]);
        return result.rows[0];
    },
    
    updateStock: async (productId, quantity) => {
        const result = await pool.query(
            'UPDATE products SET current_stock = current_stock + $1 WHERE product_id = $2 RETURNING *',
            [quantity, productId]
        );
        return result.rows[0];
    }
};

module.exports = productModel;