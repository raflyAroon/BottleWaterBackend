const express = require('express');
const router = express.Router();
const cpController = require('../controller/customerProfileControl.js');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is authenticated
// All routes here should have authentication
router.use(authMiddleware.authenticate);

// Get current user's profile
router.get('/profile', cpController.getCurrentUserProfile);

// Create or update current user's profile
router.post('/profile-user', cpController.upsertProfile);

// Get all profiles (admin only)
router.get('/profiles', authMiddleware.isAdmin, cpController.getAllProfiles);

module.exports = router;