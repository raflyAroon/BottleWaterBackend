const pool = require('../config/database').pool;
const emailNotificationModel = {
    // Create a new email notification record
    createNotification: async (notificationData) => {
        const { org_id, location_id, product_id, subject, message, sent_to } = notificationData;
        try {
            const result = await pool.query(
                `INSERT INTO email_notifications 
                (org_id, location_id, product_id, subject, message, sent_to) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [org_id, location_id, product_id, subject, message, sent_to]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating email notification:', error);
            throw new Error('Failed to create email notification');
        }
    },

    // Get all notifications for an organization
    getOrgNotifications: async (orgId) => {
        try {
            const result = await pool.query(
                `SELECT en.*, p.container_type, ol.location_name 
                FROM email_notifications en
                JOIN products p ON en.product_id = p.product_id
                JOIN org_locations ol ON en.location_id = ol.location_id
                WHERE en.org_id = $1
                ORDER BY en.sent_date DESC`,
                [orgId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting organization notifications:', error);
            throw new Error('Failed to get organization notifications');
        }
    },

    // Get all notifications for a location
    getLocationNotifications: async (locationId) => {
        try {
            const result = await pool.query(
                `SELECT en.*, p.container_type 
                FROM email_notifications en
                JOIN products p ON en.product_id = p.product_id
                WHERE en.location_id = $1
                ORDER BY en.sent_date DESC`,
                [locationId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting location notifications:', error);
            throw new Error('Failed to get location notifications');
        }
    },

    // Get all notifications for a specific product at a location
    getProductNotifications: async (locationId, productId) => {
        try {
            const result = await pool.query(
                `SELECT * FROM email_notifications 
                WHERE location_id = $1 AND product_id = $2
                ORDER BY sent_date DESC`,
                [locationId, productId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting product notifications:', error);
            throw new Error('Failed to get product notifications');
        }
    },

    // Get notification by ID
    getNotificationById: async (notificationId) => {
        try {
            const result = await pool.query(
                `SELECT en.*, p.container_type, ol.location_name, op.org_name 
                FROM email_notifications en
                JOIN products p ON en.product_id = p.product_id
                JOIN org_locations ol ON en.location_id = ol.location_id
                JOIN organizations_profiles op ON en.org_id = op.org_id
                WHERE en.notification_id = $1`,
                [notificationId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting notification by ID:', error);
            throw new Error('Failed to get notification');
        }
    }
};

module.exports = emailNotificationModel;