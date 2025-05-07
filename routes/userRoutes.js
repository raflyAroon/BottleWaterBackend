const express = require('express');
const router = express.Router();
const userController = require('../controller/userControl');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

// Protected routes
router.get('/users', authMiddleware.authenticate, authMiddleware.isAdmin, userController.getAllUsers);
router.get('/profile', authMiddleware.authenticate, userController.getUserProfile);

// Admin routes
router.put('/users/:userId/toggle-status', authMiddleware.authenticate, authMiddleware.isAdmin, userController.toggleUserStatus);

module.exports = router;