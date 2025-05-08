const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const orderCustomerRoutes = require('./routes/orderCustomerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const replenishmentRoutes = require('./routes/replenishmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
require('dotenv').config();

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test koneksi database saat startup
(async () => {
    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('Tidak dapat terhubung ke database. Aplikasi akan dihentikan.');
        process.exit(1);
    }
})();

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/orders', orderCustomerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/replenishments', replenishmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// Rute sederhana untuk tes
app.get('/', (req, res) => {
    res.json({
        message: 'Bottled Water Delivery API berhasil berjalan!',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Endpoint tidak ditemukan'
    });
});

// Mulai server
app.listen(PORT, () => {
    console.log(`Server berjalan pada port ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV}`);
    console.log(`URL: http://localhost:${PORT}`);
});

module.exports = app;