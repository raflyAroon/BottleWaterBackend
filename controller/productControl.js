// controllers/productController.js
const productModel = require('../models/productModel.js');

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await productModel.getAllProducts();
            
            res.status(200).json({
                status: 'success',
                data: products
            });
            
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil daftar produk',
                error: error.message
            });
        }
    },
    
    getProductById: async (req, res) => {
        try {
            const { productId } = req.params;
            
            const product = await productModel.getProductById(productId);
            
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Produk tidak ditemukan'
                });
            }
            
            res.status(200).json({
                status: 'success',
                data: product
            });
            
        } catch (error) {
            console.error('Error getting product:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil data produk',
                error: error.message
            });
        }
    }
};

module.exports = productController;