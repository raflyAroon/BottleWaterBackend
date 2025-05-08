const EmailNotification = require('../models/emailNotificationModel');
const { validationResult } = require('express-validator');

const notificationController = {
    sendNotification: async (req, res) => {
        try {
            const { org_id, location_id, product_id, subject, message, sent_to } = req.body;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            // Create email transporter
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            // Send email
            await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: sent_to,
                subject: subject,
                text: message,
                html: `<div style="font-family: Arial, sans-serif;">${message}</div>`
            });

            // Record notification
            const notification = await EmailNotification.createNotification({
                org_id,
                location_id,
                product_id,
                subject,
                message,
                sent_to
            });

            res.status(200).json({
                status: 'success',
                message: 'Notification sent successfully',
                data: notification
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to send notification',
                error: error.message
            });
        }
    },

    getOrganizationNotifications: async (req, res) => {
        try {
            const { orgId } = req.params;

            if (req.user.role !== 'admin' && req.user.org_id !== parseInt(orgId)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const notifications = await EmailNotification.getOrganizationNotifications(orgId);

            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            console.error('Error getting organization notifications:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve notifications',
                error: error.message
            });
        }
    },

    getLocationNotifications: async (req, res) => {
        try {
            const { locationId } = req.params;
            
            // Verify user has access to this location
            if (!req.user.isAdmin && !req.user.locations.includes(parseInt(locationId))) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to access this location\'s notifications'
                });
            }

            const notifications = await EmailNotification.getLocationNotifications(locationId);
            
            res.json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            console.error('Error getting location notifications:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get location notifications'
            });
        }
    },

    getRecentNotifications: async (req, res) => {
        try {
            const { days = 7 } = req.query;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const notifications = await EmailNotification.getRecentNotifications(days);

            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            console.error('Error getting recent notifications:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve notifications',
                error: error.message
            });
        }
    },

    getUserNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const notifications = await EmailNotification.getUserNotifications(userId);
            
            res.json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            console.error('Error getting user notifications:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get notifications'
            });
        }
    },

    getAllNotifications: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const notifications = await EmailNotification.getAllNotifications();

            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            console.error('Error getting all notifications:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve notifications',
                error: error.message
            });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;

            // Verify user owns the notification
            const notification = await EmailNotification.getNotificationById(notificationId);
            if (!notification || notification.sent_to !== req.user.email) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to update this notification'
                });
            }

            await EmailNotification.markAsRead(notificationId);
            
            res.json({
                status: 'success',
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update notification'
            });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;
            await EmailNotification.markAllAsRead(req.user.email);
            
            res.json({
                status: 'success',
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update notifications'
            });
        }
    },

    deleteNotification: async (req, res) => {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;

            // Verify user owns the notification
            const notification = await EmailNotification.getNotificationById(notificationId);
            if (!notification || notification.sent_to !== req.user.email) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to delete this notification'
                });
            }

            await EmailNotification.deleteNotification(notificationId);
            
            res.json({
                status: 'success',
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete notification'
            });
        }
    },

    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.id;
            const count = await EmailNotification.getUnreadCount(req.user.email);
            
            res.json({
                status: 'success',
                data: { count }
            });
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get unread count'
            });
        }
    },

    createTestNotification: async (req, res) => {
        // This endpoint is for testing only and should be disabled in production
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({
                status: 'error',
                message: 'Endpoint not available in production'
            });
        }

        try {
            const { subject, message } = req.body;
            const notification = {
                org_id: req.user.org_id,
                location_id: null,
                product_id: null,
                subject,
                message,
                sent_to: req.user.email
            };

            const result = await EmailNotification.createNotification(notification);
            
            res.json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error creating test notification:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create test notification'
            });
        }
    }
};

module.exports = notificationController;