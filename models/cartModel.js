const db = require('../config/database').pool;

const CartModel = {
    async ensureCartTableExists() {
        try {
            // Check if the cart table exists
            const checkTableQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'cart'
                );
            `;
            const tableExists = await db.query(checkTableQuery);
            
            if (!tableExists.rows[0].exists) {
                // Create cart table if it doesn't exist
                const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS cart (
                        cart_id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        product_id INTEGER NOT NULL,
                        quantity INTEGER NOT NULL DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
                        UNIQUE(user_id, product_id)
                    );
                `;
                await db.query(createTableQuery);
                
                // Create trigger for updating timestamps
                const createTriggerQuery = `
                    DO $$
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cart_timestamp') THEN
                            CREATE OR REPLACE FUNCTION update_timestamp()
                            RETURNS TRIGGER AS $$
                            BEGIN
                                NEW.updated_at = CURRENT_TIMESTAMP;
                                RETURN NEW;
                            END;
                            $$ LANGUAGE plpgsql;

                            CREATE TRIGGER update_cart_timestamp
                            BEFORE UPDATE ON cart
                            FOR EACH ROW
                            EXECUTE FUNCTION update_timestamp();
                        END IF;
                    END
                    $$;
                `;
                await db.query(createTriggerQuery);
                
                console.log('Cart table and trigger created successfully');
            }
            return true;
        } catch (error) {
            console.error('Error ensuring cart table exists:', error);
            throw new Error('Failed to ensure cart table exists: ' + error.message);
        }
    },

    async getCart(userId) {
        try {
            // Ensure cart table exists
            await this.ensureCartTableExists();
            
            // Get cart items
            const query = `
                SELECT c.*, p.container_type, p.description, p.unit_price, p.image_url
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = $1
            `;
            const result = await db.query(query, [userId]);
            
            // Calculate total
            let total = 0;
            for (const item of result.rows) {
                total += item.quantity * item.unit_price;
        }
            
            return {
                items: result.rows,
                total: total
};
        } catch (error) {
            console.error('Error in getCart:', error);
            throw new Error('Failed to get cart items: ' + error.message);
        }
    },

    async addToCart(userId, productId, quantity) {
        try {
            // Ensure cart table exists
            await this.ensureCartTableExists();
            
            // Check if product exists
            const productCheck = await db.query(
                'SELECT product_id FROM products WHERE product_id = $1',
                [productId]
            );
            
            if (productCheck.rows.length === 0) {
                throw new Error('Product not found');
            }
            
            // Check if item already exists in cart
            const existingItem = await db.query(
                'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
                [userId, productId]
            );

            if (existingItem.rows.length > 0) {
                // Update quantity if item exists
                const newQuantity = existingItem.rows[0].quantity + quantity;
                return await this.updateQuantity(userId, productId, newQuantity);
            }

            // Add new item if it doesn't exist
            const query = `
                INSERT INTO cart (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await db.query(query, [userId, productId, quantity]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in addToCart:', error);
            throw new Error('Failed to add item to cart: ' + error.message);
        }
    },

    async updateQuantity(userId, productId, quantity) {
        try {
            // Ensure cart table exists
            await this.ensureCartTableExists();
            
            if (quantity <= 0) {
                return await this.removeFromCart(userId, productId);
            }

            const query = `
                UPDATE cart
                SET quantity = $3, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1 AND product_id = $2
                RETURNING *
            `;
            const result = await db.query(query, [userId, productId, quantity]);
            
            if (result.rows.length === 0) {
                throw new Error('Cart item not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateQuantity:', error);
            throw new Error('Failed to update cart quantity: ' + error.message);
        }
    },

    async removeFromCart(userId, productId) {
        try {
            // Ensure cart table exists
            await this.ensureCartTableExists();
            
            const query = `
                DELETE FROM cart
                WHERE user_id = $1 AND product_id = $2
                RETURNING *
            `;
            const result = await db.query(query, [userId, productId]);
            
            if (result.rows.length === 0) {
                throw new Error('Cart item not found');
            }
            
            return result.rows[0];
        } catch (error) {
            console.error('Error in removeFromCart:', error);
            throw new Error('Failed to remove item from cart: ' + error.message);
        }
    },

    async clearCart(userId) {
        try {
            // Ensure cart table exists
            await this.ensureCartTableExists();
            
            const query = 'DELETE FROM cart WHERE user_id = $1';
            await db.query(query, [userId]);
            return true;
        } catch (error) {
            console.error('Error in clearCart:', error);
            throw new Error('Failed to clear cart: ' + error.message);
        }
    },

    async validateCart(userId) {
        try {
            // Ensure cart table exists
            await this.ensureCartTableExists();
            
            const query = `
                SELECT c.product_id, c.quantity, p.stock_quantity, p.container_type as name
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = $1 AND c.quantity > p.stock_quantity
            `;
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error('Error in validateCart:', error);
            throw new Error('Failed to validate cart: ' + error.message);
        }
    }
};

module.exports = CartModel;