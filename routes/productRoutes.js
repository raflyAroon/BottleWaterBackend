// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controller/productControl.js');

router.get('/allproduct', productController.getAllProducts);
router.get('/:productId', productController.getProductById);

module.exports = router;