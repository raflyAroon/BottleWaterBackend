const deliveryOrderModel = require('../models/deliveryOrderModel');
const orderItemModel = require('../models/orderItemModel');

const deliveryController = {
    createDelivery: async (req, res) => {
        try {
            const { order_id, driver_name, vehicle_id, departure_time, notes } = req.body;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            // Verify order exists and is in 'processing' status
            const order = await orderItemModel.getOrderById(order_id);
            if (!order) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Order not found'
                });
            }

            if (order.status !== 'processing') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Order must be in processing status to create delivery'
                });
            }

            const deliveryData = {
                order_id,
                driver_name,
                vehicle_id,
                departure_time,
                notes
            };

            const delivery = await deliveryOrderModel.createDelivery(deliveryData);

            res.status(201).json({
                status: 'success',
                message: 'Delivery created successfully',
                data: delivery
            });
        } catch (error) {
            console.error('Error creating delivery:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create delivery',
                error: error.message
            });
        }
    },

    getDeliveryById: async (req, res) => {
        try {
            const { deliveryId } = req.params;
            const delivery = await deliveryOrderModel.getDeliveryById(deliveryId);

            if (!delivery) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Delivery not found'
                });
            }

            // Check authorization for non-admin users
            if (req.user.role !== 'admin') {
                const order = await orderItemModel.getOrderById(delivery.order_id);
                if (order.user_id !== req.user.user_id) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Unauthorized access to delivery details'
                    });
                }
            }

            res.status(200).json({
                status: 'success',
                data: delivery
            });
        } catch (error) {
            console.error('Error getting delivery:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve delivery',
                error: error.message
            });
        }
    },

    getDeliveryByOrderId: async (req, res) => {
        try {
            const { orderId } = req.params;
            const delivery = await deliveryOrderModel.getDeliveryByOrderId(orderId);

            if (!delivery) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Delivery not found'
                });
            }

            // Check authorization for non-admin users
            if (req.user.role !== 'admin') {
                const order = await orderItemModel.getOrderById(orderId);
                if (order.user_id !== req.user.user_id) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Unauthorized access to delivery details'
                    });
                }
            }

            res.status(200).json({
                status: 'success',
                data: delivery
            });
        } catch (error) {
            console.error('Error getting delivery:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve delivery',
                error: error.message
            });
        }
    },

    updateDeliveryStatus: async (req, res) => {
        try {
            const { deliveryId } = req.params;
            const { status, actual_delivery_time } = req.body;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const delivery = await deliveryOrderModel.updateDeliveryStatus(
                deliveryId,
                status,
                actual_delivery_time
            );

            if (!delivery) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Delivery not found'
                });
            }

            // Update order status if delivery is completed
            if (status === 'delivered') {
                await orderItemModel.updateOrderStatus(delivery.order_id, 'delivered');
            }

            res.status(200).json({
                status: 'success',
                message: 'Delivery status updated',
                data: delivery
            });
        } catch (error) {
            console.error('Error updating delivery status:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update delivery status',
                error: error.message
            });
        }
    },

    getDriverDeliveries: async (req, res) => {
        try {
            const { driverName, status } = req.query;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const deliveries = await deliveryOrderModel.getDriverDeliveries(driverName, status);

            res.status(200).json({
                status: 'success',
                data: deliveries
            });
        } catch (error) {
            console.error('Error getting driver deliveries:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve deliveries',
                error: error.message
            });
        }
    },

    getAllDeliveries: async (req, res) => {
        try {
            const { status } = req.query;

            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const deliveries = await deliveryOrderModel.getAllDeliveries(status);

            res.status(200).json({
                status: 'success',
                data: deliveries
            });
        } catch (error) {
            console.error('Error getting all deliveries:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve deliveries',
                error: error.message
            });
        }
    }
};

module.exports = deliveryController;