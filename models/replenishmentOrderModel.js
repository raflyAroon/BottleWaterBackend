const pool = require('../config/database').pool;

const replenishmentOrderModel = {
    // Create a new replenishment order
    createOrder: async (locationId, scheduledDate) => {
        try {
            const result = await pool.query(
                `INSERT INTO replenishment_order 
                (location_id, scheduled_date) 
                VALUES ($1, $2) 
                RETURNING *`,
                [locationId, scheduledDate]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating replenishment order:', error);
            throw new Error('Failed to create replenishment order');
        }
    },

    // Add details to a replenishment order
    addOrderDetails: async (replenishmentId, products) => {
        try {
            const values = products.map(product => {
                return `(${replenishmentId}, ${product.product_id}, ${product.quantity})`;
            }).join(', ');
            
            const query = `
                INSERT INTO replenishment_details 
                (replenishment_id, product_id, quantity) 
                VALUES ${values} 
                RETURNING *
            `;
            
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error adding replenishment details:', error);
            throw new Error('Failed to add replenishment details');
        }
    },

    // Get a replenishment order by ID
    getOrderById: async (replenishmentId) => {
        try {
            const result = await pool.query(
                `SELECT ro.*, ol.location_name, ol.address, ol.org_id
                FROM replenishment_order ro
                JOIN org_locations ol ON ro.location_id = ol.location_id
                WHERE ro.replenishment_id = $1`,
                [replenishmentId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error getting replenishment order:', error);
            throw new Error('Failed to get replenishment order');
        }
    },

    // Get replenishment order details
    getOrderDetails: async (replenishmentId) => {
        try {
            const result = await pool.query(
                `SELECT rd.*, p.container_type, p.description, p.unit_price
                FROM replenishment_details rd
                JOIN products p ON rd.product_id = p.product_id
                WHERE rd.replenishment_id = $1`,
                [replenishmentId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting replenishment details:', error);
            throw new Error('Failed to get replenishment details');
        }
    },

    // Get all replenishment orders for a location
    getOrdersByLocation: async (locationId) => {
        try {
            const result = await pool.query(
                `SELECT * FROM replenishment_order 
                WHERE location_id = $1 
                ORDER BY scheduled_date DESC`,
                [locationId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting replenishment orders by location:', error);
            throw new Error('Failed to get replenishment orders');
        }
    },

    // Get all pending replenishment orders
    getPendingOrders: async () => {
        try {
            const result = await pool.query(
                `SELECT ro.*, ol.location_name, ol.address, ol.org_id, op.org_name
                FROM replenishment_order ro
                JOIN org_locations ol ON ro.location_id = ol.location_id
                JOIN organizations_profiles op ON ol.org_id = op.org_id
                WHERE ro.status = 'pending'
                ORDER BY ro.scheduled_date ASC`
            );
            return result.rows;
        } catch (error) {
            console.error('Error getting pending replenishment orders:', error);
            throw new Error('Failed to get pending replenishment orders');
        }
    },

    // Update replenishment order status
    updateOrderStatus: async (replenishmentId, status) => {
        try {
            const result = await pool.query(
                `UPDATE replenishment_order 
                SET status = $2 
                WHERE replenishment_id = $1 
                RETURNING *`,
                [replenishmentId, status]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Replenishment order not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error updating replenishment order status:', error);
            throw new Error('Failed to update replenishment order status');
        }
    },

    // Generate weekly replenishment orders for all locations
    generateWeeklyOrders: async () => {
        try {
            // Get all locations with their delivery day
            const locationsResult = await pool.query(
                'SELECT * FROM org_locations'
            );
            
            const orders = [];
            
            for (const location of locationsResult.rows) {
                // Calculate next delivery date based on delivery_day
                const nextDeliveryDate = calculateNextDeliveryDate(location.delivery_day);
                
                // Create replenishment order
                const order = await replenishmentOrderModel.createOrder(
                    location.location_id,
                    nextDeliveryDate
                );
                
                // Get replenishment levels for this location
                const levelsResult = await pool.query(
                    `SELECT rl.*, p.container_type 
                    FROM replenishment_levels rl
                    JOIN products p ON rl.product_id = p.product_id
                    WHERE rl.location_id = $1`,
                    [location.location_id]
                );
                
                // Calculate quantities needed for each product
                const products = levelsResult.rows.map(level => {
                    const quantityNeeded = Math.max(0, level.target_level - level.current_level);
                    return {
                        product_id: level.product_id,
                        quantity: quantityNeeded
                    };
                }).filter(product => product.quantity > 0);

                // Add order details if there are products to replenish
                if (products.length > 0) {
                    await replenishmentOrderModel.addOrderDetails(order.replenishment_id, products);
                }
                
                orders.push(order);
            }
            
            return orders;
        } catch (error) {
            console.error('Error generating weekly replenishment orders:', error);
            throw new Error('Failed to generate weekly replenishment orders');
        }
    }
};

// Helper function to calculate next delivery date based on day of week
function calculateNextDeliveryDate(deliveryDay) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    const dayIndex = days.indexOf(deliveryDay.toLowerCase());
    
    if (dayIndex === -1) {
        throw new Error('Invalid delivery day');
    }
    
    const todayIndex = today.getDay();
    let daysToAdd = dayIndex - todayIndex;
    
    if (daysToAdd <= 0) {
        daysToAdd += 7; // Move to next week
    }
    
    const nextDelivery = new Date(today);
    nextDelivery.setDate(today.getDate() + daysToAdd);
    
    return nextDelivery;
}

module.exports = replenishmentOrderModel;