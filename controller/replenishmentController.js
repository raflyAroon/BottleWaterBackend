const ReplenishmentOrder = require('../models/replenishmentOrderModel');
const EmailNotification = require('../models/emailNotificationModel');
const { validationResult } = require('express-validator');

const replenishmentController = {
    createReplenishmentOrder: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            const { locationId, scheduledDate, products } = req.body;
            const order = await ReplenishmentOrder.createReplenishmentOrder(
                locationId,
                scheduledDate,
                products
            );

            res.json({
                status: 'success',
                data: order
            });
        } catch (error) {
            console.error('Error creating replenishment order:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create replenishment order'
            });
        }
    },

    getReplenishmentStatus: async (req, res) => {
        try {
            const { locationId } = req.params;
            const status = await ReplenishmentOrder.getReplenishmentStatus(locationId);
            
            res.json({
                status: 'success',
                data: status
            });
        } catch (error) {
            console.error('Error getting replenishment status:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get replenishment status'
            });
        }
    },

    updateStockLevels: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            const { locationId, productId } = req.params;
            const { currentLevel, targetLevel } = req.body;

            const updatedLevel = await ReplenishmentOrder.updateStockLevels(
                locationId,
                productId,
                currentLevel,
                targetLevel
            );

            // Check if current level is below threshold and send notification
            if (currentLevel < targetLevel * 0.2) {
                const notification = {
                    org_id: req.user.org_id,
                    location_id: locationId,
                    product_id: productId,
                    subject: 'Low Stock Alert',
                    message: `Stock level for product ${productId} is below 20% of target level`,
                    sent_to: req.user.email
                };
                await EmailNotification.createNotification(notification);
            }

            res.json({
                status: 'success',
                data: updatedLevel
            });
        } catch (error) {
            console.error('Error updating stock levels:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update stock levels'
            });
        }
    },

    getLowStockItems: async (req, res) => {
        try {
            const { locationId } = req.query;
            const lowStockItems = await ReplenishmentOrder.getLowStockItems(locationId);
            
            res.json({
                status: 'success',
                data: lowStockItems
            });
        } catch (error) {
            console.error('Error getting low stock items:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get low stock items'
            });
        }
    },

    getStockOutHistory: async (req, res) => {
        try {
            const { locationId } = req.params;
            const { startDate, endDate } = req.query;

            const history = await ReplenishmentOrder.getStockOutHistory(
                locationId,
                startDate,
                endDate
            );
            
            res.json({
                status: 'success',
                data: history
            });
        } catch (error) {
            console.error('Error getting stock out history:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get stock out history'
            });
        }
    },

    getStockOutCounter: async (req, res) => {
        try {
            const { locationId } = req.params;
            const counter = await ReplenishmentOrder.getStockOutCounter(locationId);
            
            res.json({
                status: 'success',
                data: counter
            });
        } catch (error) {
            console.error('Error getting stock out counter:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get stock out counter'
            });
        }
    },

    completeReplenishmentOrder: async (req, res) => {
        try {
            const { replenishmentId } = req.params;
            const completedOrder = await ReplenishmentOrder.completeReplenishmentOrder(replenishmentId);

            // Send notification about completed replenishment
            const notification = {
                org_id: req.user.org_id,
                location_id: completedOrder.location_id,
                product_id: null, // This is a general notification
                subject: 'Replenishment Completed',
                message: `Replenishment order #${replenishmentId} has been completed`,
                sent_to: req.user.email
            };
            await EmailNotification.createNotification(notification);
            
            res.json({
                status: 'success',
                data: completedOrder
            });
        } catch (error) {
            console.error('Error completing replenishment order:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to complete replenishment order'
            });
        }
    }
};

module.exports = replenishmentController;