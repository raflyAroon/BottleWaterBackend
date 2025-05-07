const express = require('express');
const router = express.Router();
const orgContoller = require('../controller/organizationsControl.js');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check if user is authenticated
router.use(authMiddleware.authenticate);

// Organization-specific routes
router.get('/profile-org', authMiddleware.isOrganization, orgContoller.getCurrentUserProfile);
router.post('/profile-org-personalisasi', authMiddleware.isOrganization, orgContoller.upsertProfile);

// Admin-only route
router.get('/all-profiles-org', authMiddleware.isAdmin, orgContoller.getAllProfiles);

module.exports = router;