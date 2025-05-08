const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get user's notifications
router.get('/user', notificationController.getUserNotifications);

// Get location notifications (requires admin or organization access)
router.get('/location/:locationId', [
    param('locationId').isInt()
], notificationController.getLocationNotifications);

// Get organization notifications (requires admin or organization access)
router.get('/organization/:orgId', [
    param('orgId').isInt()
], notificationController.getOrganizationNotifications);

// Get recent notifications (admin only)
router.get('/recent', [
    query('days').optional().isInt().withMessage('Days must be a number')
], authMiddleware.isAdmin, notificationController.getRecentNotifications);

// Get all notifications (admin only)
router.get('/all', authMiddleware.isAdmin, notificationController.getAllNotifications);

// Mark notification as read
router.put('/:notificationId/read', [
    param('notificationId').isInt()
], notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', [
    param('notificationId').isInt()
], notificationController.deleteNotification);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Send notification (admin only)
router.post('/send', [
    body('org_id').optional().isInt(),
    body('location_id').optional().isInt(),
    body('product_id').optional().isInt(),
    body('subject').notEmpty().trim(),
    body('message').notEmpty().trim(),
    body('sent_to').isEmail()
], authMiddleware.isAdmin, notificationController.sendNotification);

// Create test notification (development only)
if (process.env.NODE_ENV !== 'production') {
    router.post('/test', [
        body('subject').notEmpty().trim(),
        body('message').notEmpty().trim()
    ], notificationController.createTestNotification);
}

module.exports = router;